import FetchUrl from "./FetchUrl.js"

export default {
	
	beforeCreate: function(){
		console.log("in before")
		FetchUrl("http://127.0.0.1:5000/api/profilePhoto", {
			method: 'delete',
			headers: {
				'Content-Type': 'appication/json',
				'Authentication-Token': localStorage.getItem('auth-token'),
			},
		})
		.then((data) => {
			console.log(data)
			sessionStorage.setItem("current_user", JSON.stringify(data))
			this.$router.push({ name: 'MyProfile'})		
		}).catch((err) => {
		console.log(err)
		})
	},
}