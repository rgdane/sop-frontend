import { Card as CardAntd, CardProps } from "antd";

type ExtendedCardProps = CardProps & {
  modules?: string | null;
};

export default function Card(props: ExtendedCardProps) {
  return (
    <CardAntd
      className="w-full transition-all duration-300 cursor-pointer group lg:flex-shrink-0 xl:w-[30%] !border !border-black/10 dark:!border-white/10 hover:!border-[#ff675780]"
      {...props}
    />
  );
}