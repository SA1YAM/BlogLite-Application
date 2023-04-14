import FetchUrl from "./FetchUrl.js"
import Header from "./Header.js"

export default{
	template: `
		<div>
			<navigation></navigation>
			<br><br>	
			<div class = "px-4 mt-4">
				<h1 class = "ms-1 px-2">Add Profile Photo</h1>
				<br><br>
				<div id="Add-photo-form" class="ms-1 row g-3 align-items-center fs-5">
				  <div class="col-10">
					<label for="formFile" class="form-label">Choose Image File</label>
					<input class="form-control" type="file" id="formFile" accept="image/*" @change="onUpload">
				  </div>		  
				  <div>
					<button @click="AddPhoto" class="btn btn-primary">Submit</button>
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
				file: null,
				path: "",
			},
		}
	},
	
	methods: {
		onUpload: function(e){
			console.log(e.target.files[0])
			this.formData.file = e.target.files[0]
			this.formData.path = e.target.files[0].name		
		},
		
		AddPhoto: function(){
			if(this.formData.file){
				console.log("good")
			}else{
				alert("please choose a file first")
				return
			}

//			console.log(this.formData.file)
			let data = new FormData()
			data.append('file', this.formData.file)
			console.log(data)
				
			FetchUrl('http://127.0.0.1:5000/api/profilePhoto', {
			method: 'post',
			headers: {
	//		  'Content-Type': 'application/json',
			  'Authentication-Token': localStorage.getItem('auth-token'),
			},
			body: data,
	//		body: JSON.stringify(this.formData),
			})
			.then((dataa) => {
				console.log(dataa)
				sessionStorage.setItem("current_user", JSON.stringify(dataa))
				this.$router.push({ name: 'MyProfile'})
			})
			.catch((err) => alert(err))
		}
	},
	
}