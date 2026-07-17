export function BrazilFlagMini() {
  return (
    <svg width="18" height="13" viewBox="0 0 22 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="22" height="16" fill="#009440" />
      <polygon points="11,1 20.5,8 11,15 1.5,8" fill="#FFCB00" />
      <circle cx="11" cy="8" r="4" fill="#302681" />
      <path fill="#FFF" d="M8.5 7C9 6.5 10 6 11 6s2 .5 2.5 1c0-1-.5-2-2.5-2S8.5 6 8.5 7z" />
      <path fill="#FFF" d="M9 9c.5.5 1.5 1 2 1s1.5-.5 2-1c0 1-.5 2-2 2s-2-1-2-2z" />
    </svg>
  );
}

export function USAFlagMini() {
  return (
    <svg width="18" height="13" viewBox="0 0 22 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="22" height="16" fill="#B31942" />
      {[1.2, 3.6, 6, 8.4, 10.8, 13.2].map((y) => (
        <rect key={y} x="0" y={y} width="22" height="1.2" fill="#FFF" />
      ))}
      <rect width="9" height="8.5" fill="#0A3161" />
      {[
        [1, 1], [3.6, 1], [6.2, 1],
        [0.4, 2.8], [2.6, 2.8], [4.8, 2.8], [7, 2.8],
        [1, 4.6], [3.6, 4.6], [6.2, 4.6],
        [0.4, 6.4], [2.6, 6.4], [4.8, 6.4], [7, 6.4],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="0.8" height="0.8" fill="#FFF" />
      ))}
    </svg>
  );
}
