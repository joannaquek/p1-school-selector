type CompareMetricRowProps = {
  label: string;
  values: string[];
};

function isDifferent(values: string[]) {
  if (values.length <= 1) return false;
  return new Set(values).size > 1;
}

export function CompareMetricRow({ label, values }: CompareMetricRowProps) {
  const different = isDifferent(values);

  return (
    <tr>
      <th>{label}</th>
      {values.map((value, idx) => (
        <td key={`${label}-${idx}`} className={different ? "compareCell--diff" : ""}>
          {value}
        </td>
      ))}
    </tr>
  );
}
