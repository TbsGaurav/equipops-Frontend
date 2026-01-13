import StatCard from '@/utils/components/StatCard';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { AiOutlineBarChart } from 'react-icons/ai';
import { CiCircleCheck } from 'react-icons/ci';
import { IoPersonOutline } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router';
import { MdOutlineAccessTime } from 'react-icons/md';
import { LuChevronLeft } from 'react-icons/lu';
import { useQuery } from '@tanstack/react-query';
import { InterviewByIdApi, InterviewJobAnalysisApi } from '@/api/InterviewApi';
import { useMemo, useState } from 'react';

import { BsThreeDotsVertical } from 'react-icons/bs';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal
} from '@radix-ui/react-dropdown-menu';
import toast from 'react-hot-toast';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, ArcElement, Tooltip, Legend);

const Index = () => {
    const navigate = useNavigate();
    const params = useParams();
    const [activeTab, setActiveTab] = useState('evaluated');

    const { data: analysisRes, isLoading } = useQuery({
        queryKey: ['job-analysis', params.id],
        queryFn: async () => {
            const res = await InterviewJobAnalysisApi({ interviewId: params.id });
            return res;
        },
        select: (res) => {
            return res?.data;
        }
    });
    const pendingApplicants = analysisRes?.candidatePendingInterviews ?? [];
    const jobInfo = analysisRes?.jobInfo;
    const candidates = analysisRes?.candidateOverview ?? [];

    const statCards = useMemo(() => {
        const kpis = analysisRes?.kpis;
        if (!kpis) return [];

        return [
            {
                title: 'Average Duration',
                // value: formatDuration(jobInfo?.duration),
                color: 'bg-orange-100',
                icon: MdOutlineAccessTime,
                change: ''
            },
            {
                title: 'Interview Completion Rate',
                value: `${kpis.interviewCompletionRate ?? 0}%`,
                color: 'bg-blue-100',
                icon: AiOutlineBarChart,
                change: ''
            },
            {
                title: 'Success Rate',
                value: `${kpis.successRate ?? 0}%`,
                color: 'bg-green-100',
                icon: CiCircleCheck,
                change: ''
            },
            {
                title: 'Candidates Interviewed',
                value: kpis.candidatesInterviewed ?? 0,
                color: 'bg-pink-100',
                icon: IoPersonOutline,
                change: ''
            }
        ];
    }, [analysisRes]);

    const performanceChartData = useMemo(() => {
        const trend = analysisRes?.performanceTrend;

        // Fixed month order
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Map backend data for quick lookup
        const trendMap = new Map(Array.isArray(trend) ? trend.map((item) => [item.month, Number(item.averageScore ?? 0)]) : []);
        return {
            labels: months,
            datasets: [
                {
                    label: 'Performance',
                    data: months.map((m) => trendMap.get(m) ?? 0),
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.08)',
                    tension: 0.35,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 4
                }
            ]
        };
    }, [analysisRes]);

    const sentimentData = useMemo(() => {
        const sentiment = analysisRes?.candidateSentiment;

        const positive = sentiment?.positive ?? 0;
        const neutral = sentiment?.neutral ?? 0;
        const negative = sentiment?.negative ?? 0;

        const total = positive + neutral + negative;

        if (total === 0) {
            return {
                labels: ['No data'],
                datasets: [
                    {
                        data: [1],
                        backgroundColor: ['#e5e7eb'],
                        borderWidth: 0
                    }
                ]
            };
        }

        return {
            labels: [`Positive (${positive})`, `Neutral (${neutral})`, `Negative (${negative})`],
            datasets: [
                {
                    data: [positive, neutral, negative],
                    backgroundColor: ['#eab308', '#60a5fa', '#f97373'],
                    borderWidth: 1
                }
            ]
        };
    }, [analysisRes]);

    const statusData = useMemo(() => {
        const status = analysisRes?.candidateStatus;

        const active = status?.active ?? 0;
        const selected = status?.hired ?? 0;
        const potential = status?.shortlisted ?? 0;
        const notSelected = status?.rejected ?? 0;

        const total = active + selected + potential + notSelected;

        // Fallback when no data
        if (total === 0) {
            return {
                labels: ['No data'],
                datasets: [
                    {
                        data: [1],
                        backgroundColor: ['#e5e7eb'], // neutral gray
                        borderWidth: 0
                    }
                ]
            };
        }

        return {
            labels: [`Active (${active})`, `Selected (${selected})`, `Potential (${potential})`, `Not Selected (${notSelected})`],
            datasets: [
                {
                    data: [active, selected, potential, notSelected],
                    backgroundColor: ['#3b82f6', '#22c55e', '#a855f7', '#e5e7eb'],
                    borderWidth: 1
                }
            ]
        };
    }, [analysisRes]);
    const { data } = useQuery({ queryKey: ['Interview-details', params.id], queryFn: () => InterviewByIdApi({ Id: params.id }) });

    return (
        <div className="flex flex-col gap-6">
            {/* Top Bar with gradient accent */}
            <div className="flex items-center gap-3 ">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center rounded-full p-1.5 hover:bg-gray-100 transition"
                >
                    <LuChevronLeft className="text-gray-700 text-xl" />
                </button>
                <h1 className="flex-1 text-2xl font-bold text-gray-900 tracking-tight">Job Analysis</h1>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="p-2 rounded-full bg-white/90  hover:bg-indigo-600 hover:text-white hover:scale-110 transition-all shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <BsThreeDotsVertical className="w-4 h-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuContent
                            side="bottom"
                            align="end"
                            className="bg-white border border-gray-200 rounded-md shadow-lg mt-1 min-w-[var(--radix-select-trigger-width)]"
                        >
                            <DropdownMenuItem
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    const formURL = `${window.location.origin}/job-application/${data?.data?.interview.interview_Form_Id}`;
                                    navigator.clipboard.writeText(formURL);
                                    toast.success('Copied Form URL to clipboard');
                                }}
                            >
                                Copy Form URL
                            </DropdownMenuItem>
                            <DropdownMenuItem className="px-4 py-2 text-sm text-red-700 hover:bg-red-100 cursor-pointer">
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenuPortal>
                </DropdownMenu>
            </div>

            {/* Overview card – subtle, not colorful */}
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 sm:px-5 sm:py-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900">Overall Analysis</h2>
                        <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">{jobInfo?.description}</p>
                    </div>

                    <div className="mt-2 sm:mt-0 flex gap-2 text-[11px] text-gray-500">
                        <span className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 bg-gray-50">
                            Role: {jobInfo?.jobName}
                        </span>
                        <span className="hidden sm:inline-flex items-center rounded-full border border-gray-200 px-3 py-1 bg-gray-50">
                            Mode: AI Interview
                        </span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />)
                    : statCards.map((card, index) => <StatCard key={index} {...card} />)}
            </div>
            <div className="flex gap-2 border-b border-gray-200 px-4">
                <button
                    onClick={() => setActiveTab('evaluated')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                        activeTab === 'evaluated'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Evaluated Candidates
                </button>

                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                        activeTab === 'pending'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Pending Applicants
                </button>
            </div>
            {activeTab === 'evaluated' && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <h3 className="text-sm font-semibold text-gray-900">Candidate overview</h3>
                        <span className="text-[11px] text-gray-500">
                            {candidates.length} candidate{candidates.length > 1 ? 's' : ''} evaluated
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-xs sm:text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left border-y">
                                    <th className="px-4 py-3 font-medium text-gray-500">Candidate</th>
                                    <th className="px-4 py-3 font-medium text-gray-500">Overall Score</th>
                                    <th className="px-4 py-3 font-medium text-gray-500">Communication</th>
                                    <th className="px-4 py-3 font-medium text-gray-500">Summary</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {candidates.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">
                                            No candidates evaluated yet
                                        </td>
                                    </tr>
                                ) : (
                                    candidates.map((p) => {
                                        const score = Number(p.overallScore ?? 0);

                                        const scoreLevel = score >= 70 ? 'Strong' : score >= 40 ? 'Average' : 'Needs improvement';

                                        return (
                                            <tr key={p.candidateId} className="hover:bg-gray-50/80 transition-colors">
                                                {/* Candidate */}
                                                <td className="px-4 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/job/candidate-details/${p.candidateId}`)}
                                                        className="flex items-center gap-3 text-left w-full"
                                                    >
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-[13px] font-semibold text-indigo-700">
                                                            {p.candidateName?.charAt(0)?.toUpperCase() || '?'}
                                                        </span>

                                                        <span className="flex flex-col">
                                                            <span className="font-medium text-gray-900">
                                                                {p.candidateName || 'Unknown'}
                                                            </span>
                                                            <span className="text-[11px] text-gray-500">View detailed report</span>
                                                        </span>
                                                    </button>
                                                </td>

                                                {/* Overall Score */}
                                                <td className="px-4 py-3 align-middle">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-semibold text-gray-800">{score}</span>
                                                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                                                                {scoreLevel}
                                                            </span>
                                                        </div>

                                                        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                                            <div
                                                                className="h-1.5 rounded-full bg-indigo-500"
                                                                style={{ width: `${Math.min(score, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Communication */}
                                                <td className="px-4 py-3 align-middle">
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700 border border-gray-200">
                                                        {Number(p.communication ?? 0)}/10
                                                    </span>
                                                </td>

                                                {/* Summary */}
                                                <td className="px-4 py-3 align-top">
                                                    <p className="text-gray-600 text-[11px] sm:text-[13px] leading-snug">
                                                        {p.summary || 'No summary available.'}
                                                    </p>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {activeTab === 'pending' && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <h3 className="text-sm font-semibold text-gray-900">Pending Applicants</h3>
                        <span className="text-[11px] text-gray-500">{pendingApplicants.length} pending</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-xs sm:text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-left border-y">
                                    <th className="px-4 py-3 font-medium text-gray-500">Candidate</th>
                                    <th className="px-4 py-3 font-medium text-gray-500">Experience</th>
                                    <th className="px-4 py-3 font-medium text-gray-500">Interview Name</th>
                                    <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                                    <th className="px-4 py-3 font-medium text-gray-500">Phone</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {pendingApplicants.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-400">
                                            No pending applicants
                                        </td>
                                    </tr>
                                ) : (
                                    pendingApplicants.map((p) => (
                                        <tr key={p.candidateId} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-[13px] font-semibold text-indigo-700">
                                                        {p.candidateName?.charAt(0)?.toUpperCase() || '?'}
                                                    </span>

                                                    <span className="font-medium text-gray-900">{p.candidateName || 'Unknown'}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-gray-700">{p.experience || ''}</td>
                                            <td className="px-4 py-3 text-gray-700">{p.interviewName || ''}</td>
                                            <td className="px-4 py-3 text-gray-700">{p.email || ''}</td>

                                            <td className="px-4 py-3 text-gray-700">{p.phone || ''}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Charts – responsive layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Performance Trend */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">Performance Trend</h3>
                        <span className="text-[11px] text-gray-500">Last 10 months</span>
                    </div>

                    <div className="mt-2 w-full h-56 sm:h-64">
                        <Line
                            data={performanceChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: {
                                        grid: { display: false },
                                        ticks: { font: { size: 10 } }
                                    },
                                    y: {
                                        ticks: { display: false },
                                        grid: { color: '#f3f4f6' }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Sentiment */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">Candidate Sentiment</h3>
                        <span className="text-[11px] text-gray-500">Feedback tone</span>
                    </div>
                    <div className="mt-2 flex-1 flex items-center justify-center">
                        <div className="w-full max-w-xs h-52 sm:h-60">
                            <Doughnut
                                data={sentimentData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom' } },
                                    cutout: '65%'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900">Candidate Status</h3>
                        <span className="text-[11px] text-gray-500">Pipeline</span>
                    </div>
                    <div className="mt-2 flex-1 flex items-center justify-center">
                        <div className="w-full max-w-xs h-52 sm:h-60">
                            <Doughnut
                                data={statusData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom' } },
                                    cutout: '65%'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;
