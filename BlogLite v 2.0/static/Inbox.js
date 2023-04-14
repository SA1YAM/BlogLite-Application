import FetchUrl from "./FetchUrl.js"
import Header from "./Header.js"

export default{
	template: `
		<div>
			<navigation></navigation>
			<br><br>	
			<div id="app" class="container text-center">
				<div class="row justify-content-center">
					<div class="col text-start">
						<h3>Inbox</h3>
					</div>
					
					<div class="col col-4">
						<p class="input-group">
							<input type="search" class="form-control rounded" placeholder="Type a username" aria-label="Search" aria-describedby="search-addon" v-model="content" />
							<button type="button" ref="searchBtn" class="btn btn-outline-primary" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample" @click="search" >
							SEARCH
							</button>
						</p>
						<div class="collapse" id="collapseExample">
						  <div class="card card-body">	
							<div class = "row">
								<ul class="list-group">
									<li class="list-group-item d-flex justify-content-between align-items-center" v-for="user in searchlist">
										{{user.username}}
										<button class="badge bg-primary rounded-pill" v-if="user.added" disabled>Added</button>
										<button class="badge bg-primary rounded-pill" @click="add(user.id)" v-else>Add</button>
									</li>
								</ul>
							</div>
						  </div>
						</div>
					</div>
				</div>
						
				<br><br>
				 
				<br>
				
				<div class="row">
					<div class="col text-start">
						<h4>Users</h4>
					</div>
				</div>
				
				<br>
				
				<div class="row w-50 row justify-content-center">
					<div class="list-group text-start">
					  <router-link :to="{ name: 'Message', query: { inboxId: inbox.inbox_id, username: inbox.username } }" class="list-group-item list-group-item-action" v-for="inbox in inboxlist" > {{ inbox.username }} </router-link>
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
			inboxlist: [],
		}
	},
	
	methods: {
		search: function(){
			this.searchlist = []
			for(let i of this.userlist){
				i["added"] = false
				let rege = "^" + this.content
				let regex = new RegExp(rege,)
				console.log(regex)
				if(regex.test(i.username)){
					for(let j of this.inboxlist){
						if(j.user_id === i.id){
//							debugger
							i.added = true
						}
					}
					this.searchlist.push(i)
				}	
			}	
			console.log("searchlist",this.searchlist)	
		},
		
		add: function(user_id){
			
			FetchUrl(`http://127.0.0.1:5000/api/inbox/${user_id}`, {
				method: 'post',
				headers: {
					'Content-Type': 'appication/json',
					'Authentication-Token': localStorage.getItem('auth-token'),
				},
				body : {},
			})
			.then((data) => {
				console.log(data)
				this.inboxlist.push(data)
			}).catch((err) => {
			console.log(err)
			})
			
			this.$refs.searchBtn.click()
			
		},
	},
	
	mounted: function(){
//		this.current_user = JSON.parse(sessionStorage.getItem("current_user"))
		FetchUrl("http://127.0.0.1:5000/api/inbox", {
			method: 'get',
			headers: {
				'Content-Type': 'appication/json',
				'Authentication-Token': localStorage.getItem('auth-token'),
			},
		})
		.then((data) => {
			console.log(data)
			this.inboxlist = data
		}).catch((err) => {
		console.log(err)
		})
	},
	
	created: function(){
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