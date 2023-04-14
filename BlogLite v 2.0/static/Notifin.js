import FetchUrl from "./FetchUrl.js"

export default {
	template : `
					<div>
						<div class="row row-cols-2">
							<div class="col">
								<button type="button" class="btn btn-primary btn-lg position-relative" data-bs-toggle="modal" data-bs-target="#exampleModal">
									Notifications
									<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" v-if="number > 0">
									{{number}}
									</span>
								</button>

								<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
								  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
									<div class="modal-content">
									  <div class="modal-header">
										<h1 class="modal-title fs-5" id="exampleModalLabel">Notifications</h1>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="clear"></button>
									  </div>
									  <div class="modal-body text-start">
										<div class="row justify-content-center" v-if="notifications.length === 0"> 
											<h5 class="text-secondary">There are currently no notifications for you</h5>
										</div>
										<ol class="list-group list-group-numbered" v-else>
										  <li class="list-group-item" v-for="notification in notifications">{{notification}}</li>
										</ol>
									  </div>
									  
									</div>
								  </div>
								</div>
							</div>
							<div class="col">
								<router-link :to="{ name: 'Inbox' }" class="btn btn-primary btn-lg" role="button" >&emsp; Inbox &emsp;</router-link>
							</div>
						</div>
					</div>
				`,
				
	data: function(){
		return{
			notifications: [],
			number: "",
		}
	},
	
	methods: {
		clear: function(){
			console.log(this.notifications)
			this.number = 0
			
			if(this.notifications.length === 0){
				return
			}
			
			FetchUrl("http://127.0.0.1:5000/api/notifications", {
				method: 'delete',
				headers: {
					'Content-Type': 'appication/json',
					'Authentication-Token': localStorage.getItem('auth-token'),
				},
				body : {},
			})
			.then((data) => {
				console.log(data)
			}).catch((err) => {
			console.log(err)
			})
			
			
		}
	},
	
	mounted: function(){
		FetchUrl("http://127.0.0.1:5000/api/notifications", {
			method: 'get',
			headers: {
				'Content-Type': 'appication/json',
				'Authentication-Token': localStorage.getItem('auth-token'),
			},
		})
		.then((data) => {
			console.log(data)
			if(data.notifications){
				if(data.notifications.includes(",")){
					this.notifications = data.notifications.split(",")
					this.number = this.notifications.length
				}else{
					this.notifications.push(data.notifications)
					this.number = 1
				}
			} else {
				this.number = 0
			}
		}).catch((err) => {
		console.log(err)
		})	
	}
}