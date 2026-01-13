import { AiOutlineInfoCircle } from 'react-icons/ai';
import { CiSearch } from 'react-icons/ci';
import { HiMenuAlt1 } from 'react-icons/hi';
import { IoNotificationsOutline } from 'react-icons/io5';
import DefaultAvatar from '/avatar.png';
import PropTypes from 'prop-types';
// import useTheme from '@/hooks/useTheme';
import { useLocation, useNavigate } from 'react-router';
import { SideList } from '@/utils/CommonList';
import { useMutation } from '@tanstack/react-query';
import { LogoutApi } from '@/api/AuthApi';
import { useDispatch } from 'react-redux';
import { clearUser } from '@/store/userSlice';
import useAuth from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import LanguageSwitcher from '@/views/Language/LanguageSwitcher';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const Navbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useAuth();
    const Page = SideList.find((i) => location.pathname.split('/').includes(i.value));

    const logoutMutation = useMutation({ mutationFn: LogoutApi });

    const [photo_url, setAvatar] = useState(DefaultAvatar);

    useEffect(() => {
        if (user?.photoUrl) {
            setAvatar(user.photoUrl);
        } else {
            setAvatar(DefaultAvatar);
        }
    }, [user]);

    const logoutHandleFC = () => {
        logoutMutation.mutateAsync({ userId: user.userId }).then(() => {
            dispatch(clearUser());
        });
    };

    return (
        <nav className="flex gap-2 items-center dark:bg-slate-700 p-2 md:px-4 py-2.5 dark:text-white sticky top-0 bg-gray-50 z-20">
            <HiMenuAlt1 size={20} className="cursor-pointer" onClick={() => toggleSidebar()} />
            <h1 className="font-semibold text-lg">{Page?.title}</h1>

            <div className="flex-1" />
            <div className="bg-slate-300/50 dark:bg-slate-900 rounded-full flex space-x-1 items-center p-1.5">
                <div className="flex items-center gap-1 py-2 md:py-0.5 px-2 bg-white dark:text-black rounded-full">
                    <CiSearch />
                    <input type="search" placeholder="Search" className="bg-transparent outline-none border-none p-1 hidden md:block" />
                </div>
                <span className="p-1">
                    <LanguageSwitcher />
                </span>
                <span className="p-1">
                    <IoNotificationsOutline size={20} />
                </span>
                {/* <span className="p-1" onClick={() => toggleTheme()}>
                    {theme === 'light' ? <GoMoon size={20} className="rotate-90" /> : <GoSun size={20} />}
                </span> */}
                <span className="p-1">
                    <AiOutlineInfoCircle size={20} />
                </span>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <img src={photo_url} className="size-8 rounded-full cursor-pointer" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            className="mx-2 min-w-[220px] rounded-md bg-white p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade data-[side=right]:animate-slideLeftAndFade data-[side=top]:animate-slideDownAndFade"
                            sideOffset={5}
                        >
                            <div className="flex flex-col px-2 py-3">
                                <p className="font-semibold text-gray-800">{user?.fullName}</p>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                            <div className="border-t flex flex-col gap-1 border-gray-200 pt-3">
                                <button
                                    className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 rounded p-1.5"
                                    onClick={() => navigate('/profile')}
                                >
                                    View Profile
                                </button>
                                <button
                                    className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 rounded p-1.5"
                                    onClick={() => navigate('/profile/change-password')}
                                >
                                    Change Password
                                </button>
                                <button
                                    className="w-full text-left text-sm text-red-600 hover:bg-red-50 rounded p-1.5"
                                    onClick={() => logoutHandleFC()}
                                >
                                    Logout
                                </button>
                            </div>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
                {/* <Popover trigger={<img src={photo_url} className="size-8 rounded-full cursor-pointer" />} position="bottom">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {user?.nameInit}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{user?.fullName}</p>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                        <div className="border-t flex flex-col gap-1 border-gray-200 pt-3">
                            <button
                                className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 rounded p-1.5"
                                onClick={() => navigate('/profile')}
                            >
                                View Profile
                            </button>
                            <button
                                className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 rounded p-1.5"
                                onClick={() => navigate('/profile/change-password')}
                            >
                                Change Password
                            </button>
                            <button
                                className="w-full text-left text-sm text-red-600 hover:bg-red-50 rounded p-1.5"
                                onClick={() => logoutHandleFC()}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </Popover> */}
            </div>
        </nav>
    );
};

Navbar.propTypes = {
    toggleSidebar: PropTypes.func.isRequired
};

export default Navbar;
