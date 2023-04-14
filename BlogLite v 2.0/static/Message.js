import FetchUrl from "./FetchUrl2.js"
import Header from "./Header.js"

export default{
	template: `
		<div>
			<navigation></navigation>
			<br><br>	
			<div id="app" class="container text-center">
				<div class="row justify-content-center">
					<div class="col text-start">
						<h3>Chat</h3>
					</div>
								
				</div>
									
				<br><br>
				<div class="row">
					<div class="col text-start">
						<h4 class="text-secondary"> {{ username }} </h4>
					</div>
				</div>			 
				<br>		
				<br>
							
				<div class="container-text-center">
					<div class="row mb-2" v-for="message in messagelist">
						<div class="row" v-if="message.sent">
							<div class="col"> </div>
							<div class="col text-start">
								<div class="card text-primary">
									<div class="card-body">
										<div class="d-flex justify-content-between">
										  <h5 class="card-title"> You </h5>
										  <small class="card-text"> {{ message.time_stamp }} </small>
										</div>
										<p class="card-text"> {{ message.message }} </p>
									</div>
								</div>
							</div>
						</div>
						<div class="row" v-else>
							<div class="col text-start"> 
								<div class="card text-secondary">
									<div class="card-body">
										<div class="d-flex justify-content-between">
										  <h5 class="card-title">{{ username }}</h5>
										  <small class="card-text">{{ message.time_stamp }}</small>
										</div>
										<p class="card-text"> {{ message.message }} </p>
									</div>
								</div>
							</div>
							<div class="col"> </div>
						</div>
					</div>
					
					<br> <br> <br>
					
					<div class="row">
						<div class="input-group">
							<input type="text" class="form-control rounded" placeholder="Type a message" aria-label="Search" aria-describedby="search-addon" v-model="formData.message" />
							<button type="button" ref="searchBtn" class="btn btn-outline-primary" @click="send" >
								Send
							</button>
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
			formData:{
				message: null,
				inbox_id: this.$route.query.inboxId,
			},
			messagelist: [],
			username: this.$route.query.username,
		}
	},
	
  methods: {
    send: function() {
		console.log(this.formData)
		if(!this.formData.message){
			alert("message cannot be empty")
			return
			}
		if(this.formData.message.trim().length < 1){
			alert("message should not contain only whitespaces")
			return
		}
		FetchUrl('http://127.0.0.1:5000/api/message', {
			method: 'post',
			headers: {
			  'Content-Type': 'application/json',
			  'Authentication-Token': localStorage.getItem('auth-token'),
			},
			body: JSON.stringify(this.formData),
		})
		.then((data) => {
			console.log(data)
			this.messagelist = data	
			this.formData.message = null
//			if(data.errors){
//				alert(data.errors)
//			} else {
//				this.$router.go()
//			}
		})
//		.catch((err) => alert(err))
		.catch((err) => alert(err.message))

    },
  },
  
  mounted: function(){
//		this.current_user = JSON.parse(sessionStorage.getItem("current_user"))
		console.log(this.$route.query.inboxId)
	
		FetchUrl(`http://127.0.0.1:5000/api/message/${this.$route.query.inboxId}`, {
			method: 'get',
			headers: {
				'Content-Type': 'appication/json',
				'Authentication-Token': localStorage.getItem('auth-token'),
			},
		})
		.then((data) => {
			console.log(data)
			this.messagelist = data
		}).catch((err) => {
		console.log(err)
		})
	},
}