interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`p-6 rounded-xl border shadow-sm flex items-center gap-4 ${color}`}>
        <div className="text-3xl">{icon}</div>
        <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
  );
}