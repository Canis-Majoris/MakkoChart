export const numberFormatter = Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

export const adjustShade = (col, amt) => {
  amt = Math.round(amt);

  let usePound = false;

  if (col[0] == '#') {
    col = col.slice(1);
    usePound = true;
  }

  let R = parseInt(col.substring(0, 2), 16);
  let G = parseInt(col.substring(2, 4), 16);
  let B = parseInt(col.substring(4, 6), 16);

  // to make the colour less bright than the input
  // change the following three "+" symbols to "-"
  R = R + amt;
  G = G + amt;
  B = B + amt;

  if (R > 255) R = 255;
  else if (R < 0) R = 0;

  if (G > 255) G = 255;
  else if (G < 0) G = 0;

  if (B > 255) B = 255;
  else if (B < 0) B = 0;

  const brightness = Math.round((R * 299 + G * 587 + B * 114) / 1000);

  const textColour = brightness > 125 ? 'black' : 'white';

  const RR = R.toString(16).length == 1 ? '0' + R.toString(16) : R.toString(16);
  const GG = G.toString(16).length == 1 ? '0' + G.toString(16) : G.toString(16);
  const BB = B.toString(16).length == 1 ? '0' + B.toString(16) : B.toString(16);

  return [(usePound ? '#' : '') + RR + GG + BB, textColour];
};

export const generatePalleteFromColor = (color, size) =>
  [...Array(size)].map((_, i) =>
    adjustShade(color, (1 - (size - i) / size) * 100)
  );

export const generateMakkoData = (data) =>
  data.map((config, i) => {
    const { key, label, color, segments } = config || {};

    const colorPalette = generatePalleteFromColor(
      color || '#000000',
      segments?.length ?? 1
    );

    const values = segments?.map((segment, index) => {
      const {
        value,
        key: segmentKey,
        label: segmentLabel,
        color: customTextColor,
        backgroundColor: customBackgroundColor,
      } = segment;

      return {
        section: key,
        value,
        label,
        segmentLabel,
        segmentKey,
        backgroundColor: customBackgroundColor ?? colorPalette[index][0],
        color: customTextColor ?? colorPalette[index][1],
      };
    });

    const item = {
      key,
      values,
    };

    values.forEach((value) => {
      value.parent = item;
    });

    return item;
  });

export const generateLengendData = (data) =>
  data.reduce((arr, { segmentKey, segmentLabel }) => {
    if (!arr.find(({ key }) => key === segmentKey))
      arr.push({ key: segmentKey, label: segmentLabel });
    return arr;
  }, []);

export const getSectionLabel = (sectionKey, data) =>
  data.find(({ key }) => key === sectionKey)?.label ?? '-';

export const getValueFormatted = (
  value,
  { prefix, suffix }: { prefix?: string; suffix?: string }
) => `${prefix}${value}${suffix}`;

export const getPercent = (value, total) =>
  numberFormatter.format((value / total) * 100);
