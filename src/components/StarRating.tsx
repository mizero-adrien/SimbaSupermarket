interface Props {
  rating: number;   // 0–5, decimals supported
  count?: number;
  size?: 'xs' | 'sm' | 'md';
  showEmpty?: boolean; // show empty stars when count is 0
}

const SIZE = {
  xs: { star: 'text-xs', text: 'text-[10px]' },
  sm: { star: 'text-sm', text: 'text-xs' },
  md: { star: 'text-lg', text: 'text-sm' },
};

export default function StarRating({ rating, count, size = 'sm', showEmpty = false }: Props) {
  if (!showEmpty && count === 0) return null;

  const { star, text } = SIZE[size];
  const filled = Math.round(rating);

  return (
    <div className="flex items-center gap-1">
      <div className={`flex leading-none ${star}`}>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className={i <= filled ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}>
            ★
          </span>
        ))}
      </div>
      {count !== undefined && (
        <span className={`${text} text-gray-500 dark:text-gray-400`}>
          {count > 0 ? `${rating.toFixed(1)} (${count})` : 'No reviews yet'}
        </span>
      )}
    </div>
  );
}
