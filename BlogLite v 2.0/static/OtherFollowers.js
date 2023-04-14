import FetchUrl from "./FetchUrl.js"
import Header from "./Header.js"

export default {
	template: `
	<div>
		<navigation></navigation>
		<br><br>
		
		<div id="app" class="container text-center ">
			<div class="row row-cols-4 mb-5 justify-content-center">
				<h3 class="text-dark text-center">{{ $route.query.username }} Profile</h3>
			</div>
		
			<div class="row">
				<div class="col text-start">
					<h3 class="card-title">Followers:</h3>
				</div>
			</div>
			
			<br><br>
			
			<div class="row justify-content-center" v-if="users.length === 0">
				<h5 class="text-secondary">There are currently no followers of this user</h5>
			</div>

			<div class="row justify-content-center" v-else>
				<div class="row">
					<ol class="text-start">
						<h5 v-for="user in users"><li><router-link :to="{ name: 'OtherProfile', params:{ userName: user.username }  }" class="link-primary"> {{ user.username }}</router-link></li><h5>
					</ol>
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
		}
	},
	
	mounted: function() {
		FetchUrl(`http://127.0.0.1:5000/api/otherFollowers/${this.$route.params.userId}`, {
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