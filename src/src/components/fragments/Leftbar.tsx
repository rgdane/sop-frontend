// Sidebar wrapper component
 export const LeftBar = ({ children }: { children: React.ReactNode }) => (
  <div className="xl:w-[25%] lg:w-[40%] lg:inline hidden overflow-auto min-h-[calc(100vh-69px)] bg-white dark:bg-[#242424] border-r border-black/10 dark:border-white/10">
    <div className="">
      {children}
    </div>
  </div>
);