export const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };
  