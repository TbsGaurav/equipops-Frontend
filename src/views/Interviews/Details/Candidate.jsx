import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FiPlay, FiPause, FiHeadphones } from 'react-icons/fi';
import { MdWorkOutline, MdEvent, MdAccessTime } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router';
import { LuChevronLeft } from 'react-icons/lu';
import { useQuery } from '@tanstack/react-query';
import { getCandidateJobAnalysisApi } from '@/api/InterviewApi';

const Candidate = () => {
    const navigate = useNavigate();
    const { candidateId } = useParams();
    // Audio player state
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(460);

    //helpers for scores
    const toPercent = (value, max = 10) => {
        if (value == null) return 0;
        return Math.min((value / max) * 100, 100);
    };
    const parseScoreText = (text) => {
        if (!text) return { percent: 0, label: '0/10' };

        const [value, total] = text.split('/').map(Number);
        return {
            percent: toPercent(value, total || 10),
            label: text
        };
    };

    const { data } = useQuery({
        queryKey: ['candidate-job-analysis', candidateId],
        queryFn: async () => {
            const res = await getCandidateJobAnalysisApi(candidateId);
            return res;
        },

        enabled: !!candidateId,
        select: (res) => {
            return res?.data;
        }
    });

    const candidate = data?.candidateInfo ?? {};
    const interview = data?.interviewInfo ?? {};
    const scores = data?.interviewScores ?? {};
    const overallPercent = scores?.overall ?? 0;
    const communication = parseScoreText(scores?.communicationText);
    const audio = data?.candidateInterviewAudioRecording;
    const audioSrc = audio?.url ?? '';
    const WAVE_BARS = [6, 12, 18, 10, 16, 8, 20, 14, 18, 12, 9, 15];
    const transcript = data?.interviewTranscript?.messages || [];

    useEffect(() => {
        if (!audioRef.current) return;

        setIsPlaying(false);
        setCurrentTime(0);

        audioRef.current.load();
    }, [audioSrc]);
    const hasAudio = Boolean(audioSrc);

    const getSpeakerLabel = (speaker) => {
        return speaker === 0 ? 'AI Interviewer' : 'Candidate';
    };

    const isAISpeaker = (speaker) => speaker === 0;

    const formatTime = (sec) => {
        const s = Math.floor(sec || 0);
        const minutes = Math.floor(s / 60);
        const seconds = s % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // const handlePlayPause = () => {
    //     if (!audioRef.current) return;
    //     if (isPlaying) {
    //         audioRef.current.pause();
    //     } else {
    //         audioRef.current.play();
    //     }
    //     setIsPlaying(!isPlaying);
    // };

    const handlePlayPause = async () => {
        if (!audioRef.current) return;

        try {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                await audioRef.current.play();
                setIsPlaying(true);
            }
        } catch (err) {
            console.error('Audio play failed:', err);
        }
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (!audioRef.current) return;
        setDuration(audioRef.current.duration || duration);
    };

    const handleSeek = (e) => {
        if (!audioRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = clickX / rect.width;
        const newTime = ratio * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };
    const progressPercent = duration ? Math.min((currentTime / duration) * 100, 100) : 0;
    const playedBars = Math.round((progressPercent / 100) * WAVE_BARS.length);

    // const getStatusStyles = (status) => {
    //     switch (status?.toLowerCase()) {
    //         case 'answered':
    //             return 'bg-emerald-500 text-white';
    //         case 'partial':
    //             return 'bg-amber-500 text-white';
    //         case 'not answered':
    //             return 'bg-red-500 text-white';
    //         default:
    //             return 'bg-gray-400 text-white';
    //     }
    // };

    return (
        <div className="w-full  mx-auto flex flex-col gap-6">
            <div className="flex items-center gap-3 ">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center rounded-full p-1.5 hover:bg-gray-100 transition"
                >
                    <LuChevronLeft className="text-gray-700 text-xl" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Back to analysis</h1>
            </div>

            {/* Candidate hero section */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 blur-xl bg-indigo-200/40 rounded-full scale-110" />
                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-indigo-50 rounded-full flex items-center justify-center text-lg sm:text-xl font-semibold text-indigo-700 border border-indigo-100">
                                {candidate?.candidateName?.charAt(0)}
                            </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">{candidate?.candidateName}</span>
                            <span className="text-xs sm:text-sm text-gray-500">{candidate?.email}</span>
                            <div className="flex flex-wrap gap-2 mt-1 text-[11px] sm:text-xs">
                                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    {candidate.role}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                                    {candidate.skills}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status & stage */}
                    <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Stage: {candidate.interviewStage}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                            Status: {candidate.interviewStatus}
                        </span>
                    </div>
                </div>
            </div>

            {!hasAudio && <span className="text-xs text-red-500">Audio recording not available</span>}
            {/* Top grid: Audio Recording + Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Audio recording card */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-gray-900 font-semibold text-sm sm:text-base">Audio Recording</p>
                            <span className="text-[11px] px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-500">
                                {formatTime(duration)} total
                            </span>
                        </div>

                        {/* Audio mock visual */}
                        <div className="relative mt-1 rounded-xl bg-slate-900 text-slate-50 overflow-hidden px-4 py-5 sm:px-6 sm:py-6 flex items-center gap-4 sm:gap-5">
                            <div className="relative z-10 flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={handlePlayPause}
                                    disabled={!hasAudio}
                                    className={`inline-flex items-center justify-center rounded-full
                                    ${hasAudio ? 'bg-white hover:scale-105' : 'bg-gray-300 cursor-not-allowed'}
                                    text-slate-900 shadow-lg w-12 h-12 sm:w-14 sm:h-14 transition`}
                                >
                                    {isPlaying ? <FiPause /> : <FiPlay />}
                                </button>
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-200">
                                    <FiHeadphones className="size-3.5" />
                                    <span>AI Interview · Audio</span>
                                </div>
                                <div className="relative mt-2 flex items-end gap-[3px] h-12 cursor-pointer" onClick={handleSeek}>
                                    {WAVE_BARS.map((h, idx) => {
                                        const isPlayed = idx < playedBars;

                                        return (
                                            <span
                                                key={idx}
                                                className={`flex-1 rounded-full transition-colors duration-300 ${
                                                    isPlayed ? 'bg-emerald-400' : 'bg-slate-500'
                                                }`}
                                                style={{ height: `${h * 2}%` }}
                                            />
                                        );
                                    })}

                                    {/* Time overlay INSIDE wave */}
                                    <div className="absolute top-1 right-2 text-[11px] sm:text-xs font-medium text-white pointer-events-none">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </div>
                                </div>
                            </div>

                            {/* Soft gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 opacity-80" />
                        </div>

                        {/* Hidden audio element */}
                        <audio
                            ref={audioRef}
                            src={audioSrc}
                            preload="metadata"
                            crossOrigin="anonymous"
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onEnded={() => setIsPlaying(false)}
                        />
                    </div>
                </div>

                {/* Snapshot / details card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
                    <p className="text-gray-900 font-semibold text-sm sm:text-base">Interview Snapshot</p>

                    <div className="space-y-3 text-xs sm:text-sm text-gray-700">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <MdWorkOutline className="text-gray-400" />
                                <span className="text-gray-600">Position</span>
                            </div>
                            <span className="font-semibold text-gray-900 text-right">{candidate?.role}</span>
                        </div>

                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <MdEvent className="text-gray-400" />
                                <span className="text-gray-600">Interview Date</span>
                            </div>
                            <span className="font-semibold text-gray-900 text-right">{interview.interviewDateText}</span>
                        </div>

                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <MdAccessTime className="text-gray-400" />
                                <span className="text-gray-600">Duration</span>
                            </div>
                            <span className="font-semibold text-gray-900 text-right">{interview.durationText}</span>
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">{scores.hiringReason}</div>
                </div>
            </div>

            {/* Scores + Sentiment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* <ScoreCard title="Overall Hiring Score" score={55} rating="55" />
                <ScoreCard title="Communication Score" score={40} rating="4/10" /> */}
                <ScoreCard title="Overall Hiring Score" score={overallPercent} rating={`${overallPercent}%`} />
                <ScoreCard title="Communication Score" score={communication.percent} rating={communication.label} />

                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex flex-col gap-3 shadow-sm">
                    <span className="font-semibold text-gray-900 text-sm sm:text-base text-center">User Sentiment</span>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        The discussion covered microservices, data management, and NopCommerce APIs. Gaurav showed familiarity with concepts
                        like data sources and security, but responses were often fragmented and lacked depth in architecture, patterns, and
                        real-world examples.
                    </p>
                </div>
            </div>

            {/* <div className="flex flex-col gap-3">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">Question Summary</span>


                {questionSummary.map((q, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-2.5 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="font-semibold text-gray-800 text-sm">{q.question}</p>

                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(q.answerStatus)}`}>
                                {q.answerStatus}
                            </span>
                        </div>

                        {q.answer && <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{q.answer}</p>}
                    </div>
                ))}
            </div> */}

            {/* Transcript */}
            <div className="flex flex-col gap-3 mb-4">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">Transcript</span>

                <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">Interview Conversation</span>

                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                        {transcript.length === 0 && <p className="text-xs text-gray-500">No transcript available.</p>}

                        {transcript.map((msg, idx) => {
                            const isAI = isAISpeaker(msg.speaker);

                            return (
                                <div key={idx} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-md space-y-1.5 ${isAI ? 'text-left' : 'text-right'}`}>
                                        {/* Speaker label */}
                                        <p
                                            className={`
                        px-3 py-1 rounded-full text-[11px] font-medium w-max
                        ${isAI ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700 ml-auto'}
                    `}
                                        >
                                            {getSpeakerLabel(msg.speaker)}
                                        </p>

                                        {/* Message */}
                                        {msg.isCodeBlock ? (
                                            <pre
                                                className={`
                            text-xs sm:text-sm rounded-2xl px-3.5 py-2 border overflow-x-auto
                            ${isAI ? 'bg-indigo-50/70 border-indigo-100 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-800'}
                        `}
                                            >
                                                <code className={`language-${msg.language || 'text'}`}>{msg.message}</code>
                                            </pre>
                                        ) : (
                                            <p
                                                className={`
                            text-xs sm:text-sm leading-relaxed rounded-2xl px-3.5 py-2 border
                            ${isAI ? 'bg-indigo-50/70 border-indigo-100 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-800'}
                        `}
                                            >
                                                {msg.message || <span className="italic text-gray-400">No response</span>}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Candidate;

export function ScoreCard({ title, score, rating }) {
    const strokeColor = score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#f97373';

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex flex-col items-center gap-3 shadow-sm">
            <span className="font-semibold text-gray-900 text-sm sm:text-base text-center">{title}</span>

            <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                    <svg className="w-full h-full" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="35" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle
                            cx="40"
                            cy="40"
                            r="35"
                            stroke={strokeColor}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(score / 100) * 220} 220`}
                            strokeLinecap="round"
                            transform="rotate(-90 40 40)"
                        />
                    </svg>

                    {/* Rating perfectly centered */}
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-base sm:text-xl text-gray-900">
                        {rating}
                    </div>
                </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
                {/* Gaurav showed a basic understanding of concepts, but several answers lacked clarity and depth. */}
            </p>
        </div>
    );
}

ScoreCard.propTypes = {
    title: PropTypes.string,
    score: PropTypes.number,
    rating: PropTypes.string
};
