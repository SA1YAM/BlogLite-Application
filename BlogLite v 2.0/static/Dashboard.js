import FetchUrl from "./FetchUrl.js"
import Header from "./Header.js"
import Notifin from "./Notifin.js"

export default {
	template: `
	<div>
		<navigation></navigation>
		<br><br>
		<div id="app" class="container text-center">
			<notification-inbox></notification-inbox>
			
			<br><br>

			<div class="row justify-content-center" v-if="posts.length > 0">
				<div class="row justify-content-center" v-for="post in posts">
					<div class="card border-dark mb-3" style="width: 50rem;" > 
							<div class="card-body text-start">
								<div class="row">
										<router-link :to="{ name: 'OtherProfile', params:{ userName: post.username }  }" class="fs-4 text-secondary"> {{ post.username }}</router-link>
								</div>
								<img v-bind:src=" '../static/Images/' + post.image_url" class="card-img-bottom" alt="...">
								<br> <br>
								<h6 class="card-title">{{ post.title }}</h6>
								<br>
								<p class="card-text">{{ post.caption }}</p>	
							
								<div class="row justify-content-evenly">
										<div class="col">
											<button class="btn btn-primary text-bg-primary" style="width: 20rem;" data-bs-toggle="collapse" href="#multiCollapseExample1" role="button" aria-expanded="false" aria-controls="multiCollapseExample1" @click="Unlike(post.post_id)" v-if="post.likes.includes(current_username)">
												Liked
											</button>
											<button class="btn btn-primary text-bg-light" style="width: 20rem;" data-bs-toggle="collapse" href="#multiCollapseExample1" role="button" aria-expanded="false" aria-controls="multiCollapseExample1" @click="like(post.post_id)" v-else>
												Like
											</button>
										</div>
										<div class="col">
											<p>
												<button class="btn btn-primary text-bg-light" style="width: 20rem;" type="button" data-bs-toggle="collapse" data-bs-target="#CollapseExample" aria-expanded="false" aria-controls="CollapseExample">
													Comment
												</button>
											</p>
											<div class="collapse" id="CollapseExample">
													<div class="input-group" style="width: 20rem;">
														<input type="text" class="form-control rounded" placeholder="Type a comment" aria-label="Search" aria-describedby="search-addon" v-model="message.comment" />
														<button type="button" ref="searchBtn" class="btn btn-outline-primary" @click="comment(post.post_id)" >
															Post
														</button>
													</div>
											</div>
										</div>
								</div>
								
								<br>
															
								<div class="row justify-content-evenly">
									<div class="col">
										<div class="accordion accordion-flush" id="accordionFlushExample" style="width: 20rem;">
											<div class="accoridon-item">
											  <h2 class="accordion-header" :id="'flush-heading'+post.post_id">
												<button
												  class="btn btn-primary accordion-button collapsed"
													type="button"
													data-bs-toggle="collapse"
													:data-bs-target="'#flush-collapse'+post.post_id"
													aria-expanded="false"
													:aria-controls="'flush-collapse'+post.post_id">
													&emsp;&emsp;&emsp;&emsp;&emsp; Total Likes &emsp;
												  <span class="badge bg-primary rounded-pill text-end">{{ post.likes.length }}</span>
												</button>
											  </h2>
											  <div
												:id="'flush-collapse'+post.post_id"
												class="accordion-collapse collapse"
												:aria-labelledby="'flush-heading'+post.post_id"
												data-bs-parent="#accordionFlushExample">
												<div class="accordion-body">
													<div class="accordion-body" v-if="post.likes.length > 0">
														<ol class="text-start">
															<li v-for="like in post.likes"><router-link :to="{ name: 'OtherProfile', params:{ userName: like }  }" class="link-primary"> {{ like }}</router-link></li>
														</ol>
													</div>
													<div class="accordion-body" v-else>
														<p>There are no likes yet</p>
													</div>
												</div>
											  </div>
											</div>
										</div>
								  </div>
								  
									<div class="col">
										<div class="accordion accordion-flush" id="accordionFlushExample1" style="width: 20rem;">
											<div class="accoridon-item">
											  <h2 class="accordion-header" :id="'flush-heading1'+post.post_id">
												<button
												  class="btn btn-primary accordion-button collapsed"
													type="button"
													data-bs-toggle="collapse"
													:data-bs-target="'#flush-collapse1'+post.post_id"
													aria-expanded="false"
													:aria-controls="'flush-collapse1'+post.post_id">
													&emsp;&emsp;&emsp;&emsp;Total Comments &emsp;
												  <span class="badge bg-primary rounded-pill text-end">{{ post.comments.length }}</span>
												</button>
											  </h2>
											  <div
												:id="'flush-collapse1'+post.post_id"
												class="accordion-collapse collapse"
												:aria-labelledby="'flush-heading1'+post.post_id"
												data-bs-parent="#accordionFlushExample1">
												<div class="accordion-body">
													<div class="accordion-body" v-if="post.comments.length > 0">
														<ul class="list-group text-start">
														  <li v-for="comment in post.comments">
															<p><router-link :to="{ name: 'OtherProfile', params:{ userName: comment.comment_username } }" class="link-primary">{{ comment.comment_username }}</router-link> <span> : {{comment.content}} </span></p>
														  </li>
														</ul>
													</div>
													<div class="accordion-body" v-else>
														<p>There are no comments yet</p>
													</div>
												</div>
											  </div>
											</div>
										</div>
									</div>
								</div>
							</div>
					</div>
				</div>
			</div>
			<div class="row justify-content-center" v-else> 
				<h5 class="text-secondary">There are currently no posts in your feed</h5>
			</div>
		</div>
	`,
	
	components:{
		"navigation": Header,
		"notification-inbox": Notifin,
	},
	
	data: function() {
		return {
			posts: [],
			current_username: "",
			message: {
				comment: "",
			},
		}
	},
	
	methods: {
		like: function(post_id){
			FetchUrl(`http://127.0.0.1:5000/api/like/${post_id}`, {
				method: 'post',
				headers: {
					'Content-Type': 'appication/json',
					'Authentication-Token': localStorage.getItem('auth-token'),
				},
				body : {},
			})
			.then((data) => {
				console.log(data)
	//			this.$router.go()
				this.posts = data
			}).catch((err) => {
			console.log(err)
			})
			
			
		},
		
		Unlike: function(post_id){
			FetchUrl(`http://127.0.0.1:5000/api/like/${post_id}`, {
				method: 'delete',
				headers: {
					'Content-Type': 'appication/json',
					'Authentication-Token': localStorage.getItem('auth-token'),
				},
				body : {},
			})
			.then((data) => {
				console.log(data)
	//			this.$router.go()
				this.posts = data
			}).catch((err) => {
			console.log(err)
			})
			
		},
		
		comment: function(post_id) {
			console.log(this.message)
			if(!this.message.comment){
				alert("comment cannot be empty")
				return
			}
			if(this.message.comment.trim().length < 1){
				alert("comment should not contain only whitespaces")
				return
			}
			FetchUrl(`http://127.0.0.1:5000/api/comment/${post_id}`, {
				method: 'post',
				headers: {
				  'Content-Type': 'application/json',
				  'Authentication-Token': localStorage.getItem('auth-token'),
				},
				body: JSON.stringify(this.message),
			})
			.then((data) => {
				console.log(data)
				this.posts = data 
				this.message.comment = ""
			})
			.catch((err) => alert(err))
		},
	},
	
	mounted: function() {		
		FetchUrl("http://127.0.0.1:5000/api/dashboard", {
			method: 'get',
			headers: {
				'Content-Type': 'appication/json',
				'Authentication-Token': localStorage.getItem('auth-token'),
			},
		})
		.then((data) => {
			console.log(data)
			this.posts = data
			let current_user = JSON.parse(sessionStorage.getItem("current_user"))
			this.current_username = current_user.username
		}).catch((err) => {
		console.log(err)
		})
	},

	
}
	
