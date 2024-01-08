export function getLatestRoomID(playerCount) {
  const room = Math.floor(playerCount / 2);
  return room.toString();
}
