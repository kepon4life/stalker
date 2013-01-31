class FrontendController < ApplicationController  
	before_filter :authenticate_user
	before_filter :is_frontend_user

	def index
		respond_to do |format|
			format.html
		end
	end


	
end