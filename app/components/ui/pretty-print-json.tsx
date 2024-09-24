const PretterPrintJson = ({ data }: { data: string }) => {
  const parsed = JSON.parse(data);

  return <Recursive data={parsed} />
}

const Recursive = ({ data, level = 0 }: { data: any, level?: number }) => {
  if (Array.isArray(data)) {
    return <div className={`level-${level} ml-5 mb-4`}>{data.map((v, i) => <Recursive key={`level-${level}-index-${i}`} data={v} level={level+1} />)}</div>;
  } else if (typeof data === 'object' && data !== null) {
    const typed = data as Record<string, any>;
    return <div className={`level-${level} ml-5 mb-4`}>{Object.keys(typed).map((k, i) => <div key={`level-${level}-index-${i}-key-${k}`}><div className="mb-2">{k}:</div><Recursive data={typed[k]} level={level + 1} /></div>)}</div>
  } else if (data === null) {
    return null;
  } else if (typeof data === 'string') {
    return <div className={`level-${level} ml-5 mb-4`}>{data}</div>
  } else {
    return <div className={`level-${level} ml-5 mb-4`}>{data}</div>
  }
}

export { PretterPrintJson };
