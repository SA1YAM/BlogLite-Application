import FetchUrl from "./FetchUrl.js"
import Header from "./Header.js"

export default {
	template: `
	<div>
		<navigation></navigation>
		<br><br>
		
		<div id="app" class="container text-center ">
		
			<div class="row">
				<div class="col text-start">
					<h3 class="card-title">Following:</h3>
				</div>
			</div>
			
			<br><br>
			
			<div class="row justify-content-center" v-if="users.length === 0">
				<h5 class="text-secondary">You are currently following no-one. Please follow others via connect</h5>
			</div>

			<div class="row justify-content-center" v-else>
			
				<div class="row" v-for="user in users">
					<div class="row">
						<div class="col text-center">
							<h5><router-link :to="{ name: 'OtherProfile', params:{ userName: user.username }  }" class="link-primary"> {{ user.username }}</router-link></h5>
						</div>
						<div class="col text-center">
							<button class="btn btn-primary" @click="Unfollow(user.id)">UnFollow</button>
						</div>
					</div>
					<div class="row"> <br> </div>
				</div>
			</div>
		  
		  
		  
		</div>
	`,
	
	components:{
		"navigation": Header 
	},
	
	data: function() {
		return {
			users: [],
			current_user: {},
		}
	},
	
	methods: {
		Unfollow: function(user_id){
			let index = this.current_user.following.indexOf(user_id)
			this.current_user.following.splice(index,1)
			sessionStorage.setItem("current_user", JSON.stringify(this.current_user))
			
			FetchUrl(`http://127.0.0.1:5000/api/connect/${user_id}`, {
				method: 'delete',
				headers: {
					'Content-Type': 'appication/json',
					'Authentication-Token': localStorage.getItem('auth-token'),
				},
				body : {},
			})
			.then((data) => {
				console.log(data)
				this.$router.go()
			}).catch((err) => {
			console.log(err)
			})
			
		},
	},
	
	mounted: function() {
		this.current_user = JSON.parse(sessionStorage.getItem("current_user"))
		FetchUrl("http://127.0.0.1:5000/api/following", {
			method: 'get',
			headers: {
				'Content-Type': 'appication/json',
				'Authentication-Token': localStorage.getItem('auth-token'),
			},
		})
		.then((data) => {
			console.log(data)
			this.users = data
		}).catch((err) => {
		console.log(err)
		})
	},
	
}