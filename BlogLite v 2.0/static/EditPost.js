import FetchUrl from "./FetchUrl.js"
import checkPostForm from "./CheckPostForm.js"
import Header from "./Header.js"

export default{
	template: `
		<div>
			<navigation></navigation>
			<br><br>
			<div class = "px-4 mt-4">
				<h1 class = "ms-1 px-2">Edit Blog</h1>
				<br><br>
				<div id="create-card-form" class="ms-1 row g-3 align-items-center fs-5">
				  <div class="col-10">
					<label for="exampleFormControlInput1" class="form-label">Title</label>
					<input type="text" name = "title" required class="form-control" v-model="formData.title" maxlength="20">
					<div id="textHelpBlock" class="form-text">
						 Card Title should be less than 20 characters and should not match with any other Card Title within selected list.
					</div>
				  </div>
				  <div class="col-10" >
					  <label for="exampleFormControlTextarea1" class="form-label">Caption</label>
					  <textarea name = "caption" required class="form-control" rows="3" v-model="formData.caption"></textarea>
				  </div>
				  <div class="col-10" style="width: 50rem;">
					  <label for="exampleFormControlTextarea1" class="form-label">Uploaded Image</label>
					  <img v-bind:src=" '../static/Images/' + $route.query.image_url" class="img-fluid img-thumbnail" alt="...">
				  </div>
				  <div class="col-10">
					<label for="formFile" class="form-label">Change Image</label>
					<input class="form-control" type="file" id="formFile" accept="image/*" @change="onUpload">
				  </div>
				  <div class="ms-1 col-8 form-check form-switch">
					  <input class="form-check-input" name = "archive_switch" type="checkbox" role="switch" id="flexSwitchCheckDefault" v-model="formData.archive_switch">
					  <label class="form-check-label" for="flexSwitchCheckDefault">Archive</label>
				  </div>			  
				  <div>
					<button @click="EditPost($route.query.postId)" class="btn btn-primary">Submit</button>
				  </div>
				  <div class="text-danger">
					  <p v-if="errors.length > 0">
						<b class="card-title">Please correct the following error(s):</b>
						<ul>
						  <li v-for="error in errors">{{ error }}</li>
						</ul>
					  </p>
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
			formData: {
				title: this.$route.query.title,
				caption: this.$route.query.caption,
				archive_switch: false,
				image_url : this.$route.query.image_url,
				file: null,
				present: false,
			},
			errors: [],
		}
	},
	
	methods: {
		onUpload: function(e){
			this.formData.file = e.target.files[0]
//			this.formData.image_url = e.target.files[0].name		
			console.log(this.formData.file, this.archive_switch)
		},
		
		EditPost: function(post_id){
			let checkList = JSON.parse(sessionStorage.getItem("postNames"))
			this.errors = checkPostForm(this.formData)
			if( this.formData.title !== this.$route.query.title){
				if(checkList.includes(this.formData.title)){
					this.errors.push("title already exists for some other post please change the title")
				}
			}
			if(this.errors.length > 0){
				return
			}
			
			
			console.log(this.formData)
			
			if(this.formData.file){
				this.formData.present = true
			} else {
				this.formData.present = false
			}
			
			let data = new FormData()
			for(let i in this.formData){
				data.append(i, this.formData[i])
			}
			
			console.log(data)
			console.log(this.formData)
			
			FetchUrl(`http://127.0.0.1:5000/api/post/${post_id}`, {
				method: 'put',
				headers: {
				  'Authentication-Token': localStorage.getItem('auth-token'),
				},
				body: data,
		  })
		  .then((dataa) => {
			  console.log(dataa)
			  this.$router.push({name: 'MyProfile'})
		  })
		  .catch((err) => alert(err))
		}
	},
	
	mounted: function(){
		
		if(this.$route.query.archive_switch === true){
			this.formData.archive_switch = true
		} else if(this.$route.query.archive_switch === "false"){
			console.log("archive", false)
			this.formData.archive_switch = false	
		} else if(this.$route.query.archive_switch === "true") {
			console.log("archive", true)
			this.formData.archive_switch = true
		}
		
		let checkList = JSON.parse(sessionStorage.getItem("postNames"))
		
		if(!checkList){
			FetchUrl("http://127.0.0.1:5000/api/myposts", {
				method: 'get',
				headers: {
					'Content-Type': 'appication/json',
					'Authentication-Token': localStorage.getItem('auth-token'),
				},
			})
			.then((data) => {
				console.log(data)
				sessionStorage.setItem("postNames", JSON.stringify(data.posts))
			}).catch((err) => {
			console.log(err)
			})
		}
		
		console.log(this.$route.query.archive_switch, this.formData.archive_switch)
	},
}