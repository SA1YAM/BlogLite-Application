import FetchUrl from "./FetchUrl.js"

export default {
	
	beforeCreate: function(){
		console.log("in before")
		FetchUrl("http://127.0.0.1:5000/logout", {
			method: 'post',
			headers: {
				'Content-Type': 'appication/json',
				'Authentication-Token': localStorage.getItem('auth-token'),
			},
		})
		.then((data) => {
			console.log(data)
		}).catch((err) => {
		console.log(err)
		})
		sessionStorage.clear()
		localStorage.clear()
		this.$router.push('/')
	}
}