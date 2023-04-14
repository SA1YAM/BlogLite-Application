import FetchUrl from "./FetchUrl.js"

export default {
	template : `
					<div>
						<nav class="navbar navbar-expand-lg bg-primary bg-opacity-25">
							<div class="container-fluid">
								<span class="navbar-brand">Welcome, {{username}} </span>
								
								<router-link :to="{ name: 'MyProfile' }" class="navbar-brand" >My Profile</router-link>
								<router-link :to="{ name: 'CreatePost' }" class="navbar-brand" >Add Blog</router-link>
								<router-link :to="{ name: 'Dashboard' }" class="navbar-brand" >My Feed</router-link>
								<router-link :to="{ name: 'Search' }" class="navbar-brand" >Connect</router-link>
								
								<div class="nav-item dropdown navbar-brand">
								  <a class="nav-link dropdown-toggle"  role="button" data-bs-toggle="dropdown" aria-expanded="false">
									Account Actions
								  </a>
								  <ul class="dropdown-menu">
									<li><router-link :to="{  name: 'UserManual' }" class="dropdown-item" >User's Manual</router-link></li>
									<li><router-link :to="{  name: 'ReportFormat' }" class="dropdown-item" >Change Report Format</router-link></li>
									<li><router-link :to="{  name: 'DeleteUser' }"  class="dropdown-item" >Delete Account</router-link></li>
								  </ul>
								</div>
							
								<router-link :to="{ name: 'Logout' }" class="navbar-brand" >Logout</router-link>
							</div>
								
						</nav>
					</div>
				`,
				
	data: function(){
		return{
			username: ""
		}
	},
	
	mounted: function(){
		let user = JSON.parse(sessionStorage.getItem("current_user"))
		
		if(user){
			console.log("username", user.username)
			this.username = user.username
		}else{
			FetchUrl("http://127.0.0.1:5000/api/user", {
				method: 'get',
				headers: {
					'Content-Type': 'appication/json',
					'Authentication-Token': localStorage.getItem('auth-token'),
				},
			})
			.then((data) => {
				console.log(data)
				this.username = data.username
				sessionStorage.setItem("current_user", JSON.stringify(data))
			}).catch((err) => {
			console.log(err)
			})
		}
			
	}
}