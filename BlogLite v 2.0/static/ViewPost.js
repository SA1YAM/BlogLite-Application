import FetchUrl from "./FetchUrl.js"
import Header from "./Header.js"

export default {
	template: `
	<div>
		<navigation></navigation>
		<br><br>
		<div id="app" class="container text-center ">
			
			<div class="row justify-content-center">
					<div class="card border-dark mb-3" style="width: 50rem;" > 
							<div class="card-body text-start">
								<div class="row">
									<div class="col">
										<h3 class="card-title">{{ post.title }}</h3>
									</div>
									<div class="col">
										<div class="dropdown card-title text-end">
											  <button class="btn btn-secondary btn-sm text-bg-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
												⋮
											  </button>
											  <ul class="dropdown-menu">
												<li><router-link :to="{ name: 'EditPost' }" class="dropdown-item"" >Edit</router-link></li>
											  </ul>
										</div>
									</div>		
								</div>
								<br>
								<img v-bind:src=" '../static/Images/' + post.image_url" class="card-img-bottom" alt="...">
								<br> <br>
								
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
											  <h2 class="accordion-header" id="flush-heading">
												<button
												  class="btn btn-primary accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse" aria-expanded="false" aria-controls="flush-collapse">
													&emsp;&emsp;&emsp;&emsp;&emsp; Total Likes &emsp;
												  <span class="badge bg-primary rounded-pill text-end">{{ post.likes.length }}</span>
												</button>
											  </h2>
											  <div id="flush-collapse" class="accordion-collapse collapse" aria-labelledby="flush-heading" data-bs-parent="#accordionFlushExample">
												<div class="accordion-body">
													<div class="accordion-body" v-if="post.likes.length > 0">
														<ol class="text-start">
															<li v-for="like in post.likes"><router-link :to="{ name: 'OtherProfile', params:{ userName: like }  }" class="link-primary">{{ like }}</router-link></li>
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
											  <h2 class="accordion-header" id="flush-heading1">
												<button class="btn btn-primary accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse1" aria-expanded="false" aria-controls="flush-collapse1">
													&emsp;&emsp;&emsp;&emsp;Total Comments &emsp;
												  <span class="badge bg-primary rounded-pill text-end">{{ post.comments.length }}</span>
												</button>
											  </h2>
											  <div id="flush-collapse1" class="accordion-collapse collapse" aria-labelledby="flush-heading1" data-bs-parent="#accordionFlushExample1">
												<div class="accordion-body">
													<div class="accordion-body" v-if="post.comments.length > 0">
														<ul class="list-group text-start mb-2">
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
	</div>
	`,
	
	components:{
		"navigation": Header,
	},
	
	data: function() {
		return {
			post: {},
			current_username: "",
			message: {
				comment: "",
			},
		}
	},
	
	methods: {
		like: function(post_id){
			this.post.likes.push(this.current_username)
			
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
	//			this.posts = data
				
			}).catch((err) => {
			console.log(err)
			})
			
			
		},
		
		Unlike: function(post_id){
			let index = this.post.likes.indexOf(this.current_username)
			this.post.likes.splice(index,1)
			
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
	//			this.posts = data
			}).catch((err) => {
			console.log(err)
			})
			
		},
		
		comment: function(post_id) {
			console.log(this.message)
			let commt = {}
			commt["comment_username"] = this.current_username
			commt["content"] = this.message.comment
			commt["post_id"] = post_id
			this.post.comments.push(commt)
			
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
//				this.posts = data
				this.message.comment = ""
			})
			.catch((err) => alert(err))
		},
	},
	
	mounted: function() {
		FetchUrl(`http://127.0.0.1:5000/api/post/${this.$route.params.postId}`, {
			method: 'get',
			headers: {
				'Content-Type': 'appication/json',
				'Authentication-Token': localStorage.getItem('auth-token'),
			},
		})
		.then((data) => {
			console.log(data)
			this.post = data
		}).catch((err) => {
		console.log(err)
		})
	},
	
	created: function(){
		let current_user = JSON.parse(sessionStorage.getItem("current_user"))
		this.current_username = current_user.username
	}

	
}
	
