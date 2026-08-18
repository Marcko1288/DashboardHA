export const chart = [
    ['Lun', 8.4], 
    ['Mar', 11.2], 
    ['Mer', 9.6], 
    ['Gio', 14.8], 
    ['Ven', 12.1], 
    ['Sab', 7.5], 
    ['Dom', 6.8]
].map(function (item) {
  return {
    day: item[0], value: item[1]
  }
});