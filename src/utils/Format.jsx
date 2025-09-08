export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};



if (typeof Headers !== 'undefined' && !Headers.prototype.getAll) {
  Headers.prototype.getAll = function(name) {
    const values = [];
    for (const [key, value] of this.entries()) {
      if (key.toLowerCase() === name.toLowerCase()) {
        values.push(value);
      }
    }
    return values;
  };
}