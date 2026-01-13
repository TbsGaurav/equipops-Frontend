import { InterviewCallEndApi, InterviewCallRegisterApi, InterviewTokenValidateApi } from '@/api/InterviewApi';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuClock4, LuMic, LuMicOff } from 'react-icons/lu';
import { MdOutlineCancel } from 'react-icons/md';
import { useSearchParams } from 'react-router';
import { RetellWebClient } from 'retell-client-js-sdk';
import PropTypes from 'prop-types';
import Button from '@/utils/components/ui/Button';

/* ================= MAIN COMPONENT ================= */

const InterviewCall = () => {
    const [search] = useSearchParams();
    const token = search.get('token');

    const [started, setStarted] = useState(false);
    const [ended, setEnded] = useState(false);
    const [activeTurn, setActiveTurn] = useState('idle');
    const [muted, setMuted] = useState(false);
    const [seconds, setSeconds] = useState(0);

    const [lastInterviewerResponse, setLastInterviewerResponse] = useState('');
    const [lastUserResponse, setLastUserResponse] = useState('');

    const webClientRef = useRef(null);
    const audioRef = useRef(null);
    const micStreamRef = useRef(null);
    const timerRef = useRef(null);

    // 🔹 Countdown states
    const [remainingSeconds, setRemainingSeconds] = useState(null);
    const [canEnterInterview, setCanEnterInterview] = useState(false);

    const { data, isFetching } = useQuery({
        queryKey: ['Validate-Token', token],
        queryFn: () => InterviewTokenValidateApi({ token: token }),
        select: (res) => res.data
    });

    const registerMutation = useMutation({
        mutationFn: InterviewCallRegisterApi
    });

    const { register, handleSubmit } = useForm({
        defaultValues: {
            name: '',
            email: '',
            token: token
        }
    });

    /* ================= INIT SDK + EVENTS ================= */
    useEffect(() => {
        const client = new RetellWebClient();
        webClientRef.current = client;

        // Create audio element once
        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.playsInline = true;
        document.body.appendChild(audio);
        audioRef.current = audio;

        // Remote audio
        client.on('track', (track, stream) => {
            if (track.kind === 'audio') {
                audio.srcObject = stream;
                audio.play().catch(console.error);
            }
        });

        // Call lifecycle
        client.on('call_started', () => {
            setStarted(true);
            startTimer();
        });

        client.on('call_ended', () => {
            stopTimer();
            setEnded(true);
        });

        // Speaker detection
        client.on('agent_start_talking', () => setActiveTurn('agent'));
        client.on('agent_stop_talking', () => {
            setActiveTurn('');
        });

        client.on('update', (update) => {
            if (update.turntaking === 'user_turn') {
                setActiveTurn('user');
            }
            if (update.transcript) {
                const transcripts = update.transcript;
                const roleContents = {};

                transcripts.forEach((transcript) => {
                    roleContents[transcript?.role] = transcript?.content;
                });

                setLastInterviewerResponse(roleContents['agent']);
                setLastUserResponse(roleContents['user']);
            }
        });

        // Cleanup (INLINE → no ESLint deps issue)
        return () => {
            stopTimer();
            client.removeAllListeners();
            client.stopCall?.();
            audio.pause();
            audio.remove();
            micStreamRef.current?.getTracks()?.forEach((t) => t.stop());
        };
    }, []);

    /* ================= COUNTDOWN INIT ================= */

    useEffect(() => {
        if (!data) return;

        if (data.remainingMinutes > 0) {
            setRemainingSeconds(data.remainingMinutes * 60);
            setCanEnterInterview(false);
        } else {
            setCanEnterInterview(true);
        }
    }, [data]);

    /* ================= COUNTDOWN RUN ================= */

    useEffect(() => {
        if (remainingSeconds === null || canEnterInterview) return;

        if (remainingSeconds <= 0) {
            setCanEnterInterview(true);
            return;
        }

        const interval = setInterval(() => {
            setRemainingSeconds((s) => s - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [remainingSeconds, canEnterInterview]);

    /* ================= TIMER ================= */
    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setSeconds((s) => s + 1);
        }, 1000);
    };

    const stopTimer = () => {
        clearInterval(timerRef.current);
    };

    const formatTime = () => {
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    const formatRemainingTime = () => {
        if (remainingSeconds === null) return '00:00';
        const m = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
        const s = String(remainingSeconds % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    /* ================= CALL ACTIONS ================= */
    const startCall = async (formData) => {
        try {
            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = stream;

            // Register the call and get access token
            const res = await registerMutation.mutateAsync(formData);

            // console.log(res);
            // const testToken =
            //     'eyJhbGciOiJIUzI1NiJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6IndlYl9jYWxsX2M2M2MxZjQzYzgyYWFiNzI2ZDNmODZlOGRiNSJ9LCJpc3MiOiJBUEl3UkNGdVBCYXdtMmgiLCJleHAiOjE3NjcyNDgzNzAsIm5iZiI6MCwic3ViIjoiY2xpZW50In0.Zxr2K-9xvTxvpAhfanvyBnhjqyAmMDL10Cxieq943Rg';
            // await webClientRef.current.startCall({
            //     accessToken: testToken,
            //     microphoneStream: micStreamRef.current
            // });

            await webClientRef.current.startCall({
                accessToken: res.data.access_token,
                microphoneStream: micStreamRef.current
            });

            setStarted(true);
            startTimer();
        } catch (err) {
            console.error('❌ Interview start failed:', err);

            // Stop mic if anything fails
            micStreamRef.current?.getTracks()?.forEach((t) => t.stop());
            micStreamRef.current = null;

            if (err.name === 'NotAllowedError') {
                alert('Microphone permission was denied. Please allow mic access.');
            } else {
                alert('Failed to start interview. Please try again.');
            }
        }
    };

    const endCallMutation = useMutation({ mutationFn: InterviewCallEndApi });
    const endCall = () => {
        // Stop the Retell call
        webClientRef.current?.stopCall();

        // Stop microphone stream
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach((track) => track.stop());
            micStreamRef.current = null;
        }

        // Remove SDK references
        webClientRef.current?.removeAllListeners();
        webClientRef.current = null;

        endCallMutation.mutateAsync({
            call_id: registerMutation.data.data.call_id,
            interview_id: data.interview_id,
            interviewer_id: data.interviewer_id,
            candidate_id: data.candidate_id,
            organization_id: data.organization_id
        });

        stopTimer();
        setEnded(true);
    };

    const toggleMute = () => {
        const track = micStreamRef.current?.getAudioTracks()?.[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setMuted(!track.enabled);
    };

    /* ================= UI ================= */
    if (isFetching) {
        return (
            <div className="h-dvh flex justify-center items-center bg-gradient-to-br from-slate-100 to-slate-200">
                <div className="bg-white rounded-3xl shadow-xl p-8 w-[90%] max-w-md text-center">
                    <div className="flex justify-center mb-5">
                        <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">Verifying your interview session</h2>

                    <p className="mt-2 text-sm text-gray-500">Please wait a moment while we securely validate your access.</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="h-dvh flex justify-center items-center bg-gradient-to-br from-slate-100 to-slate-200">
                <div className="bg-white rounded-3xl shadow-xl p-8 w-[90%] max-w-md text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-red-600 text-2xl">!</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>

                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                        We couldn’t verify your interview session at the moment. This may be due to an expired link, network issue, or a
                        temporary server problem.
                    </p>

                    <div className="mt-5 text-xs text-gray-400">Please refresh the page or try again after a few moments.</div>
                </div>
            </div>
        );
    }

    if (!canEnterInterview) {
        return (
            <div className="h-dvh flex justify-center items-center bg-gradient-to-br from-slate-100 to-slate-200">
                <div className="bg-white rounded-3xl shadow-xl p-8 w-[90%] max-w-md text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center">
                            <LuClock4 className="text-indigo-600 text-2xl" />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-800">Interview Starting Soon</h2>

                    <p className="mt-1 text-sm text-gray-500">Please wait, your interview will begin automatically</p>

                    <div className="mt-6">
                        <p className="text-4xl font-extrabold text-indigo-600 tracking-widest">{formatRemainingTime()}</p>
                        <p className="text-xs text-gray-500 mt-1">Time remaining</p>
                    </div>
                </div>
            </div>
        );
    }

    if (ended) {
        return (
            <div className="h-dvh flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <div className="bg-white rounded-3xl shadow-xl p-10 w-[90%] max-w-md text-center">
                    <div className="flex justify-center mb-5">
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 text-3xl">✓</span>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800">Interview Completed</h2>

                    <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                        Thank you for taking the time to complete the interview. Your responses have been successfully recorded and
                        submitted for review.
                    </p>

                    <div className="mt-6 text-xs text-gray-400">You may now safely close this window.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-dvh flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            {started ? (
                <div className="w-[90%] max-w-5xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-8 text-white">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-red-500 text-xs font-semibold animate-pulse">LIVE</span>
                            <span className="flex items-center gap-2 text-sm text-gray-200">
                                <LuClock4 /> {formatTime()}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={toggleMute}
                                className={`p-3 rounded-full border transition ${
                                    muted ? 'bg-red-500 border-red-500' : 'bg-white/10 hover:bg-white/20'
                                }`}
                            >
                                {muted ? <LuMicOff /> : <LuMic />}
                            </button>

                            <button onClick={endCall} className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition">
                                <MdOutlineCancel />
                            </button>
                        </div>
                    </div>

                    {/* Speaking Status */}
                    <div className="mt-10 text-center">
                        <h3 className="text-xl font-semibold tracking-wide">
                            {activeTurn === 'agent'
                                ? '🎧 Interviewer is speaking'
                                : activeTurn === 'user'
                                  ? '🎤 You are speaking'
                                  : 'Listening...'}
                        </h3>

                        {/* Wave animation */}
                        <div className="mt-4 flex justify-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <span
                                    key={i}
                                    className={`h-3 w-1 rounded-full bg-green-400 ${
                                        activeTurn !== 'idle' ? 'animate-pulse' : 'opacity-30'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Avatars */}
                    <div className="mt-12 grid grid-cols-2 gap-20">
                        <SpeakingAvatar
                            label="You"
                            role={data.candidateData.candidate_name || 'Candidate'}
                            active={activeTurn === 'user'}
                            data={data.candidateData}
                            lastResponse={lastUserResponse}
                        />
                        <SpeakingAvatar
                            label="Interviewer"
                            role={data.interviewerData.interviewer_name || 'AI Interviewer'}
                            active={activeTurn === 'agent'}
                            data={data.interviewerData}
                            lastResponse={lastInterviewerResponse}
                        />
                    </div>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit(startCall)}
                    className="w-[80%] lg:w-[40%] rounded-3xl shadow-xl bg-white p-5 flex flex-col gap-1 justify-center items-center"
                >
                    <img src="/avatar.png" className="h-14 rounded-full" />
                    <p className="text-lg font-bold">{data.interviewData.interview_name || 'Interview'}</p>
                    <span className="font-medium text-gray-500">Expected duration: {data.interviewData.duration_mins} mins or less</span>

                    <div className="my-2 p-5 border border-gray-100 bg-gray-100 w-full rounded-xl grid gap-2">
                        <p className="text-gray-600 font-bold">Ensure your volume is up and grant microphone access when prompted.</p>
                        <p className="text-gray-600">Additionally, please make sure you are in a quiet environment.</p>
                        <p className="text-gray-600">
                            <b>Note</b> : Tab switching will be recorded.
                        </p>
                    </div>

                    <input
                        {...register('name')}
                        className="border border-gray-300 p-2 mb-2 w-full rounded-lg"
                        placeholder="Enter Your Name"
                    />
                    <input
                        {...register('email')}
                        className="border border-gray-300 p-2 mb-2 w-full rounded-lg"
                        placeholder="Enter Your Email Address"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        className="w-full"
                        disabled={registerMutation.isPending}
                        loading={registerMutation.isPending}
                    >
                        Start Interview
                    </Button>
                </form>
            )}
        </div>
    );
};

/* ================= AVATAR COMPONENT ================= */

const Avatar = ({ label, active }) => (
    <div className="text-center">
        <div className={`h-20 w-20 rounded-full mx-auto mb-2 ${active ? 'ring-4 ring-green-400 animate-pulse' : 'bg-gray-200'}`} />
        <p className="font-medium">{label}</p>
    </div>
);

Avatar.propTypes = {
    label: PropTypes.string.isRequired,
    active: PropTypes.bool
};

Avatar.defaultProps = {
    active: false
};

export default InterviewCall;

const SpeakingAvatar = ({ label, role, active, data, lastResponse }) => (
    <div className="text-center">
        <div
            className={`relative h-28 w-28 mx-auto rounded-full flex items-center justify-center text-2xl font-bold
            ${active ? 'bg-green-500 shadow-[0_0_40px_rgba(34,197,94,0.7)]' : 'bg-gray-600'}
            transition-all duration-300`}
        >
            {data.interviewer_avatar || data.candidate_avatar ? (
                <img src={data.interviewer_avatar || data.candidate_avatar} alt={label} className="h-28 w-28 rounded-full object-cover" />
            ) : (
                <span className="text-2xl">{label[0]}</span>
            )}

            {active && <span className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping" />}
        </div>

        <p className="mt-3 font-semibold">{label}</p>
        <p className="text-sm text-gray-400">{role}</p>

        {/* {active && <p className="mt-2 inline-block px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-300">Speaking</p>} */}
        {lastResponse && <p className="mt-2 inline-flex px-3 py-1 text-sm">{lastResponse}</p>}
    </div>
);

SpeakingAvatar.propTypes = {
    label: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    active: PropTypes.bool,
    data: PropTypes.any,
    lastResponse: PropTypes.any
};
