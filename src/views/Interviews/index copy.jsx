// import { IoCopyOutline } from 'react-icons/io5';
import { MdArrowOutward, MdEdit } from 'react-icons/md';
import { FiPhoneCall, FiPlusCircle } from 'react-icons/fi';
import Model from '@/utils/components/Model';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import InputField from '@/utils/components/ui/InputField';
import CreateInterview from './CreateInterview/Index';
import { cn } from '@/utils/Utils';

const TempData = [
    {
        title: 'Frontend Developer Interview',
        count: 10
    },
    {
        title: 'Backend Developer Interview',
        count: 5
    },
    {
        title: 'Fullstack Developer Interview',
        count: 8
    },
    {
        title: 'UI/UX Designer Interview',
        count: 3
    },
    {
        title: 'Project Manager Interview',
        count: 2
    },
    {
        title: 'Project Manager Interview',
        count: 2
    },
    {
        title: 'Project Manager Interview',
        count: 2
    },
    {
        title: 'Project Manager Interview',
        count: 2
    },
    {
        title: 'Project Manager Interview',
        count: 2
    },
    {
        title: 'Project Manager Interview',
        count: 2
    },
    {
        title: 'DevOps Engineer Interview',
        count: 4
    }
];

const CardBgColors = ['bg-blue-300/50', 'bg-green-700/30', 'bg-amber-800/30', 'bg-fuchsia-700/30', 'bg-orange-200/80', 'bg-indigo-500/30'];

const Interviews = () => {
    const [popup, setPopup] = useState(false);
    const [mailPopup, setMailPopup] = useState(false);
    const [candidateMail, setCandidateMail] = useState('');
    const navigate = useNavigate();

    const DetailHandler = () => {
        navigate('/job/detail');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            <div
                className={cn(
                    'flex flex-col rounded-lg group shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer'
                )}
                onClick={() => setPopup(true)}
            >
                <div className="flex-1 flex items-center justify-center relative bg-indigo-600/60 rounded-t-lg">
                    <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition hover:scale-150 duration-300">
                        <button className="bg-white p-2 rounded-full flex items-center justify-center shadow hover:bg-white focus:animate-ping transition size-16">
                            <FiPlusCircle className="size-8" />
                        </button>
                    </div>
                </div>
                <div className={`flex p-3 px-4 rounded-b-lg items-center bg-white/ py-6 justify-center text-indigo-700`}>
                    <b>Create An Interview</b>
                </div>
            </div>

            {TempData.map((item, index) => (
                <div
                    key={index}
                    className={cn(
                        'flex flex-col rounded-lg group shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer',
                        CardBgColors[index % CardBgColors.length]
                    )}
                    onClick={() => DetailHandler()}
                >
                    <div className="flex-1 flex items-center justify-center relative rounded-t-lg">
                        <img
                            src={`./interview${[(index % 6) + 1]}.png`}
                            className="p-2 bg-contain bg-no-repeat bg-center first:group-hover:blur-[3px] transition-all duration-300"
                        />
                        <div className="absolute top-3 right-3 flex gap-2 z-50">
                            <button
                                className="p-2 rounded-full bg-gray-100 opacity-0 group-hover:opacity-100 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:scale-110 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/job/edit');
                                }}
                            >
                                <MdEdit />
                            </button>
                            <button
                                className="p-2 rounded-full bg-gray-100 opacity-0 group-hover:opacity-100 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:scale-110 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMailPopup(true);
                                }}
                            >
                                <MdArrowOutward />
                            </button>
                            <button
                                className="p-2 rounded-full bg-gray-100 opacity-0 group-hover:opacity-100 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:scale-110 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/call/0fhj6gh97fgh0fgh76gfh858dfg43j5hj243242y4y3urtwf9x8v90');
                                }}
                            >
                                <FiPhoneCall />
                            </button>
                            {/* <button
                                        className="p-2 rounded-full bg-gray-100 text-indigo-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText('');
                                        }}
                                    >
                                        <IoCopyOutline />
                                    </button> */}
                        </div>
                    </div>
                    <div className="flex p-3 px-4 rounded-b-lg items-center bg-white/60 justify-between">
                        <b>{item.title}</b>

                        <span className="flex items-center justify-center bg-indigo-500 text-white rounded-full w-8 aspect-square leading-none font-semibold shrink-0">
                            {item.count}
                        </span>
                    </div>
                </div>
            ))}

            {popup && (
                <Model title="Create An Interview" onClose={() => setPopup(false)}>
                    <CreateInterview />
                </Model>
            )}

            {mailPopup && (
                <Model title="Interview Schedule" onClose={() => setMailPopup(false)}>
                    <div className="flex flex-col gap-3 text-black">
                        <div className="fl-card">
                            <span className="font-semibold">
                                Send the interview meeting link to the candidate via email. It will contain the meeting link and schedule
                                details for the interview.
                            </span>
                        </div>

                        <div>
                            <label className="font-semibold text-gray-600">
                                Candidate Mail Address <span className="text-red-500">*</span>
                            </label>
                            <InputField
                                name="candidate_email"
                                placeholder="Enter Candidate Mail"
                                error={!candidateMail}
                                onChange={(e) => setCandidateMail(e.target.value)}
                            />
                            {!candidateMail && <p className="text-sm text-red-500">Please Enter Candidate Email</p>}
                        </div>

                        <button className="fl-button fl-button-primary">Send Invitation</button>
                    </div>
                </Model>
            )}
        </div>
    );
};

export default Interviews;
