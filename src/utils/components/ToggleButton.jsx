const ToggleButton = () => {
    return (
        <div
            className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer
                      dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
                      peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:start-[4px]
                      after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 
                       after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-600"
        />
    );
};

export default ToggleButton;
