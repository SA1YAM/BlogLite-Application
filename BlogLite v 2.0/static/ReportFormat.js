import FetchUrl from "./FetchUrl.js"
import Header from "./Header.js"

export default{
	template: `
		<div>
			<navigation></navigation>
			<br><br>
			<div class = "container px-4 mt-4">
				<div>
					<h1 class = "card- title ms-1 px-2 text-center">Change Report Format</h1>
					<br><br>
				</div>
				<div class="card-text">
					<div class="card-title">Change your report format as suitable for you. 
					Choose PDF if you want to recieve the engagement report as an pdf file.
					Defaul report format is HTML
				</div>
				<br>
				<div>
					<div class="form-check">
					  <input class="form-check-input" type="radio" id="one" value="pdf" v-model="formData.report_format">
					  <label class="form-check-label" for="one">
						PDF
					  </label>
					</div>
					<div class="form-check">
					  <input class="form-check-input" type="radio" id="two" value="html" v-model="formData.report_format">
					  <label class="form-check-label" for="two">
						HTML
					  </label>
					</div>
					<br>
					<div>
					<button type="submit" class="btn btn-primary" @click="changeformat">Change</button>
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
				report_format: "",
			}
		}
	},
	
  methods: {
    changeformat: function() {
		console.log(this.formData)
		FetchUrl('http://127.0.0.1:5000/api/reportFormat', {
			method: 'put',
			headers: {
			  'Content-Type': 'application/json',
			  'Authentication-Token': localStorage.getItem('auth-token'),
			},
			body: JSON.stringify(this.formData),
		})
		.then((data) => {
			console.log(data)
			sessionStorage.setItem("current_user", JSON.stringify(data))
			this.$router.push({name: 'MyProfile'})
		})
		.catch((err) => alert(err))
		},
	},
  
  mounted: function(){
		let user = JSON.parse(sessionStorage.getItem("current_user"))
		this.formData.report_format = user.report_format	
	},
}