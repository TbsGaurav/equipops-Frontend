import { useEffect, useMemo, useRef, useState } from 'react';
import InputField from '@/utils/components/ui/InputField';
import { useNavigate } from 'react-router';
import { LuChevronLeft } from 'react-icons/lu';
import { FiPlay, FiPause, FiVolume2 } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { InterviewerVoiceListApi } from '@/api/InterviewerApi';
import { RotatingLines } from 'react-loader-spinner';

const InterviewerVoiceList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeVoiceId, setActiveVoiceId] = useState(null);

    // Single global audio element (not per row)
    const audioRef = useRef(null);

    const {
        data: voices = [],
        isLoading,
        isError
    } = useQuery({
        queryKey: ['interviewer-voices-list'],
        queryFn: InterviewerVoiceListApi,
        select: (res) => res.data
    });

    // Initialize audio + ended event once
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.addEventListener('ended', () => {
                setActiveVoiceId(null);
            });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    // Optional: when search changes, stop any playing audio (to avoid weird states)
    useEffect(() => {
        if (!audioRef.current) return;
        if (!searchTerm) return;

        // If you *want* audio to keep playing while searching, remove this block
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setActiveVoiceId(null);
    }, [searchTerm]);

    // 🔍 Client-side search on API data
    const filteredVoices = useMemo(() => {
        if (!voices || !Array.isArray(voices)) return [];
        if (!searchTerm.trim()) return voices;

        const term = searchTerm.toLowerCase();
        return voices.filter((voice) => {
            return (
                voice.voice_name?.toLowerCase().includes(term) ||
                voice.provider?.toLowerCase().includes(term) ||
                voice.gender?.toLowerCase().includes(term) ||
                voice.accent?.toLowerCase().includes(term)
            );
        });
    }, [voices, searchTerm]);

    const totalCount = filteredVoices.length;

    const handlePlay = (voiceId, url) => {
        if (!audioRef.current) return;

        // If clicking again on same voice while playing: pause it
        if (activeVoiceId === voiceId && !audioRef.current.paused) {
            audioRef.current.pause();
            setActiveVoiceId(null);
            return;
        }

        // Always stop current audio and play new one
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = url;

        audioRef.current
            .play()
            .then(() => {
                setActiveVoiceId(voiceId);
            })
            .catch(() => {
                // autoplay blocked or other error
                setActiveVoiceId(null);
            });
    };

    const handlePause = () => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setActiveVoiceId(null);
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 ">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center rounded-full p-1.5 hover:bg-gray-100 transition"
                    >
                        <LuChevronLeft className="text-gray-700 text-xl" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Interviewer Voices</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Curate and test the voices used in your interview flows.</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex-1">
                        <label className="block mb-1 text-xs font-semibold text-slate-500">Search voices</label>
                        <InputField
                            type="text"
                            placeholder="Search by name, provider, gender, or accent..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                            }}
                            className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-dark/40 bg-white/80"
                        />
                    </div>

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="mt-1 text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors self-start sm:self-auto"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                    <p>
                        Showing <span className="font-semibold text-slate-700">{totalCount}</span> voice
                        {totalCount !== 1 && 's'} matching your search.
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50/80 border-b border-slate-200/80 backdrop-blur">
                            <tr>
                                <th className="p-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide">Voice</th>
                                <th className="p-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                    Provider & Type
                                </th>
                                <th className="p-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide">Demographics</th>
                                <th className="p-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide">Accent</th>
                                <th className="p-3 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide">Preview</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2 text-gray-500">
                                            <RotatingLines
                                                visible={true}
                                                height="24"
                                                width="24"
                                                color="currentColor"
                                                strokeWidth="5"
                                                animationDuration="0.75"
                                                ariaLabel="rotating-lines-loading"
                                            />
                                            Loading voices...
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {isError && !isLoading && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-red-500">
                                        Failed to load voices. Please try again.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && !isError && filteredVoices.length > 0
                                ? filteredVoices.map((voice) => {
                                      const isActive = activeVoiceId === voice.voice_id;
                                      return (
                                          <tr
                                              key={voice.voice_id}
                                              className={`transition-colors ${
                                                  isActive ? 'bg-primary/5' : 'odd:bg-white even:bg-slate-50/40 hover:bg-slate-100/60'
                                              }`}
                                          >
                                              {/* Voice / Avatar */}
                                              <td className="p-3">
                                                  <div className="flex items-center gap-3">
                                                      <div className="relative">
                                                          {voice.avatar_url ? (
                                                              <img
                                                                  src={voice.avatar_url}
                                                                  alt={voice.voice_name}
                                                                  className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm"
                                                              />
                                                          ) : (
                                                              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                                                                  N/A
                                                              </div>
                                                          )}
                                                          {voice.recommended && (
                                                              <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white px-1.5 py-0.5 shadow">
                                                                  ★
                                                              </span>
                                                          )}
                                                      </div>
                                                      <div>
                                                          <div className="font-semibold text-slate-900 leading-tight">
                                                              {voice.voice_name}
                                                          </div>
                                                          <div className="text-[11px] text-slate-500">ID: {voice.voice_id}</div>
                                                      </div>
                                                  </div>
                                              </td>

                                              {/* Provider & Type */}
                                              <td className="p-3 align-top">
                                                  <div className="flex flex-col gap-1.5">
                                                      <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                          <span className="text-[11px] font-semibold text-slate-700">
                                                              {voice.provider || 'Unknown provider'}
                                                          </span>
                                                          <span className="ml-1 text-[10px] uppercase tracking-wide text-slate-400">
                                                              provider
                                                          </span>
                                                      </div>

                                                      <div className="flex flex-wrap gap-1">
                                                          {voice.voice_type && (
                                                              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
                                                                  <span className="mr-1 text-[9px] uppercase tracking-wide text-indigo-400">
                                                                      Voice
                                                                  </span>
                                                                  {voice.voice_type}
                                                              </span>
                                                          )}

                                                          {voice.standard_voice_type && (
                                                              <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-600">
                                                                  <span className="mr-1 text-[9px] uppercase tracking-wide text-sky-400">
                                                                      Mode
                                                                  </span>
                                                                  {voice.standard_voice_type}
                                                              </span>
                                                          )}
                                                      </div>
                                                  </div>
                                              </td>

                                              {/* Demographics */}
                                              <td className="p-3 align-top">
                                                  <div className="flex flex-wrap gap-1">
                                                      {voice.gender && (
                                                          <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-600 capitalize">
                                                              {voice.gender}
                                                          </span>
                                                      )}
                                                      {voice.age && (
                                                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                                                              {voice.age}
                                                          </span>
                                                      )}
                                                  </div>
                                              </td>

                                              {/* Accent */}
                                              <td className="p-3 align-top">
                                                  {voice.accent ? (
                                                      <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-600">
                                                          {voice.accent}
                                                      </span>
                                                  ) : (
                                                      <span className="text-xs text-slate-400">-</span>
                                                  )}
                                              </td>

                                              {/* Preview with icon buttons */}
                                              <td className="p-3 align-top">
                                                  {voice.preview_audio_url ? (
                                                      <div className="flex items-center gap-2">
                                                          <button
                                                              type="button"
                                                              onClick={() =>
                                                                  isActive
                                                                      ? handlePause()
                                                                      : handlePlay(voice.voice_id, voice.preview_audio_url)
                                                              }
                                                              className={`inline-flex items-center justify-center rounded-full border px-2.5 py-2 text-xs shadow-sm transition ${
                                                                  isActive
                                                                      ? 'border-primary-dark bg-primary-dark text-white hover:bg-primary'
                                                                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                                                              }`}
                                                              aria-label={isActive ? 'Pause preview audio' : 'Play preview audio'}
                                                          >
                                                              {isActive ? (
                                                                  <FiPause className="text-[14px]" />
                                                              ) : (
                                                                  <FiPlay className="text-[14px] ml-0.5" />
                                                              )}
                                                          </button>

                                                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                                              <FiVolume2 className="text-[13px]" />
                                                              Preview
                                                          </span>
                                                      </div>
                                                  ) : (
                                                      <span className="text-xs text-slate-400">No audio</span>
                                                  )}
                                              </td>
                                          </tr>
                                      );
                                  })
                                : !isLoading &&
                                  !isError && (
                                      <tr>
                                          <td colSpan={5} className="p-12">
                                              <div className="flex flex-col items-center">
                                                  <span className="text-5xl mb-2">🎙️</span>
                                                  <p className="font-semibold text-slate-700">No interviewer voices found</p>
                                                  <p className="mt-1 text-xs text-slate-500">
                                                      Try changing the search term or add a new voice profile.
                                                  </p>
                                              </div>
                                          </td>
                                      </tr>
                                  )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InterviewerVoiceList;
