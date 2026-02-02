// rooms/verification.js
async verifyRoomCreated(roomCode) {
    const ref = firebase.database().ref('rooms/' + roomCode);
    const snapshot = await ref.once('value');
    return snapshot.exists();
}