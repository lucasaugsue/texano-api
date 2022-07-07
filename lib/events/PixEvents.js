
export default function PixEvents(socket){
    socket.on("/hooks/transactions", data => {
		console.log({data});
		socket.broadcast.emit(`paid`, data)
	})
    
}
