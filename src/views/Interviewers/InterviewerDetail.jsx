import { InterviewerByIdApi } from '@/api/InterviewerApi';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { IoPlayCircleOutline, IoPauseCircleOutline, IoVolumeMedium } from 'react-icons/io5';
import { MdOutlineFileDownload } from 'react-icons/md';
import { Link } from 'react-router';
import { useRef, useState, useLayoutEffect } from 'react';
import { RotatingLines } from 'react-loader-spinner';

const formatTime = (sec = 0) => {
    if (!sec || isNaN(sec)) return '0:00';
    const s = Math.floor(sec % 60)
        .toString()
        .padStart(2, '0');
    const m = Math.floor(sec / 60);
    return `${m}:${s}`;
};

const InterviewerDetail = ({ InterviewerId }) => {
    const { data, isFetching } = useQuery({
        queryKey: ['interviewer-by-id', InterviewerId],
        queryFn: () => InterviewerByIdApi({ id: InterviewerId }),
        select: (res) => res.data
    });

    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Attach listeners whenever the audio element exists and URL is present.
    useLayoutEffect(() => {
        const audio = audioRef.current;
        if (!audio || !data?.record_url) return;

        // reset UI
        setIsPlaying(false);
        setCurrentTime(0);

        const syncDuration = () => {
            if (!isNaN(audio.duration) && audio.duration > 0) {
                setDuration(audio.duration);
            }
        };

        const onLoaded = () => syncDuration();
        const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
        const onEnded = () => setIsPlaying(false);

        audio.addEventListener('loadedmetadata', onLoaded);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);

        // ✅ IMPORTANT: handle reopen case
        if (audio.readyState >= 1) {
            syncDuration();
        }

        return () => {
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
            audio.pause();
        };
    }, [data?.record_url]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio || !data?.record_url) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            return;
        }

        audio
            .play()
            .then(() => {
                setIsPlaying(true);
            })
            .catch(() => {
                // try reload -> play as fallback
                try {
                    audio.load();
                    audio
                        .play()
                        .then(() => setIsPlaying(true))
                        .catch((e) => {
                            console.error('Playback failed after reload', e);
                        });
                } catch (e) {
                    console.error('Playback error', e);
                }
            });
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-20">
                <RotatingLines
                    visible={true}
                    height="1.5em"
                    width="1.5em"
                    color="currentColor"
                    strokeWidth="5"
                    animationDuration="0.75"
                    ariaLabel="loading-interviewers"
                />
                <span className="ml-3 text-gray-600 text-sm">Loading interviewer details...</span>
            </div>
        );
    }
    if (!data) {
        return <div className="p-6 text-center text-sm text-gray-500">Unable to load interviewer details.</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header + avatar */}
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 opacity-60 blur-sm" />
                    <img
                        src={data.avatar_url || null}
                        alt={data.name}
                        className="relative w-28 h-28 rounded-full object-cover object-top border-4 border-white shadow-md"
                    />
                </div>

                <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center justify-center gap-2">🎙️ {data.name}</h2>
                    <p className="text-xs uppercase tracking-[0.18em] text-indigo-500">Interviewer Profile</p>
                </div>

                <p className="text-gray-600 text-sm max-w-xl">
                    Hi! I&apos;m {data.name}, an enthusiastic and empathetic interviewer with a curious mindset. I balance empathy, rapport,
                    and exploration to create meaningful and insightful conversations.
                </p>

                {/* Quick tags */}
                <div className="flex flex-wrap justify-center gap-2 text-[11px]">
                    <span className="rounded-full bg-indigo-50 text-indigo-700 px-3 py-1">Curious explorer</span>
                    <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1">Empathetic listener</span>
                    <span className="rounded-full bg-amber-50 text-amber-700 px-3 py-1">Structured conversations</span>
                </div>
            </div>

            {/* Audio preview card (working play/pause + progress visual tied to audio) */}
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between text-gray-800">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={togglePlay}
                            className="rounded-full hover:bg-gray-100 p-1.5"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                            type="button"
                        >
                            {isPlaying ? <IoPauseCircleOutline className="w-6 h-6" /> : <IoPlayCircleOutline className="w-6 h-6" />}
                        </button>

                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Sample interview tone</span>
                            <span className="text-xs text-gray-500">
                                {formatTime(currentTime)} / {formatTime(duration || 0)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-600">
                        <button
                            onClick={() => {
                                const a = audioRef.current;
                                if (!a) return;
                                a.muted = !a.muted;
                            }}
                            className="hover:text-gray-900"
                            aria-label="Toggle mute"
                            type="button"
                        >
                            <IoVolumeMedium className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => {
                                if (data.record_url) window.open(data.record_url, '_blank');
                            }}
                            className="hover:text-gray-900"
                            aria-label="Open audio in new tab"
                            type="button"
                        >
                            <MdOutlineFileDownload className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Progress bar tied to currentTime / duration */}
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-150"
                        style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                        aria-hidden="true"
                    />
                </div>

                <div className="flex justify-between text-[11px] text-gray-500">
                    <span>Preview voice sample</span>
                    <span>High clarity · Warm tone</span>
                </div>

                {/* hidden audio element — src only set when URL exists to avoid empty "" */}
                <audio ref={audioRef} src={data?.record_url || undefined} />
            </div>

            {/* Footer actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                    Language: <span className="font-medium text-gray-700">English</span> · Tone:{' '}
                    <span className="font-medium text-gray-700">Warm & exploratory</span>
                </div>

                <Link
                    to="/interviewers/voices"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                    <span>🔊</span>
                    <span>Show voices</span>
                </Link>
            </div>
        </div>
    );
};

InterviewerDetail.propTypes = {
    InterviewerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default InterviewerDetail;
