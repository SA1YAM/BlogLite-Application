import FetchUrl from "./FetchUrl.js"
import Header from "./Header.js"

export default{
	template: `
		<div>
			<navigation></navigation>
			<br><br>	
			<div id="app" class="container text-center ">
			
				<div class="row">
					<div class="col text-start">
						<h3>Search</h3>
					</div>
				</div>
				
				<br><br>

				<div class="row justify-content-center">
					<p class="input-group">
					  <input type="search" class="form-control rounded" placeholder="Search" aria-label="Search" aria-describedby="search-addon" v-model="content" />
					  <button type="button" ref="searchBtn" class="btn btn-outline-primary" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample" @click="search" >
						SEARCH
					  </button>
					</p>
					<div class="collapse" id="collapseExample">
					  <div class="card card-body">
						<div class="row justify-content-center" v-if="searchlist.length === 0">
							<h5 class="text-secondary">There are no users matching this username</h5>
						</div>
						<div class="row" v-else>
							<ul class="list-group">
							  <li class="list-group-item d-flex justify-content-between align-items-center" v-for="user in searchlist">
							  <router-link :to="{ name: 'OtherProfile', params:{ userName: user.username }  }" class="link-primary"> {{ user.username }} </router-link>
								<button class="badge bg-primary rounded-pill" @click="Unfollow(user.id)" v-if="user.following">UnFollow</button>
								<button class="badge bg-primary rounded-pill" @click="follow(user.id)" v-else>Follow</button>
							  </li>
							</ul>
						</div>
					  </div>
					</div>
				</div>	
			</div>
		</div>
	`,
	
	components:{
		"navigation": Header 
	},
	
	data: function(){
		return{
			content: "",
			userlist: [],
			searchlist: [],
			current_user: {},
		}
	},
	
	methods: {
		search: function(){
			this.searchlist = []
			for(let i of this.userlist){
				let rege = "^" + this.content
				let regex = new RegExp(rege,)
				console.log(regex)
				if(regex.test(i.username)){
					if(this.current_user.following.includes(i.id)){
						i.following = true
					} else {
						i.following = false
					}
					this.searchlist.push(i)
				}
				
			}
			console.log("searchlist",this.searchlist)	
		},
		
		follow: function(user_id){
			this.current_user.following.push(user_id)
			sessionStorage.setItem("current_user", JSON.stringify(this.current_user))
			
			FetchUrl(`http://127.0.0.1:5000/api/connect/${user_id}`, {
				method: 'post',
				headers: {
					'Content-Type': 'appication/json',
					'Authentication-Token': localStorage.getItem('auth-token'),
				},
				body : {},
			})
			.then((data) => {
				console.log(data)
//				this.current_user = data
			}).catch((err) => {
			console.log(err)
			})
			
			this.$refs.searchBtn.click()
			
		},
		
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
//				this.current_user = data
			}).catch((err) => {
			console.log(err)
			})
			
			this.$refs.searchBtn.click()
		},
	},
	
	mounted: function(){
		this.current_user = JSON.parse(sessionStorage.getItem("current_user"))
		FetchUrl("http://127.0.0.1:5000/api/connect", {
			method: 'get',
			headers: {
				'Content-Type': 'appication/json',
				'Authentication-Token': localStorage.getItem('auth-token'),
			},
		})
		.then((data) => {
			console.log(data)
			this.userlist = data
		}).catch((err) => {
		console.log(err)
		})
	},
}