type WaveProps = {
  className?: string;
};

export const Wave = ({ className }: WaveProps) => {
  return (
    <svg
      width="1464"
      height="256"
      viewBox="0 0 1464 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 119.044C262.363 175.894 522.758 173.59 781.184 112.131C1039.61 50.6722 1267.22 13.2953 1464 0V256H0V119.044Z"
        fill="currentColor"
      />
    </svg>
  );
};
