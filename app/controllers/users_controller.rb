class UsersController < ApplicationController  
	before_filter :authenticate_user, :only => [:new, :index]
	before_filter :is_admin_user

	def index
		@users = User.all
	end


	def new
		@user = User.new 
	end

	def create
		@user = User.new(params[:user])
		if @user.save
			flash[:success] = "User was successfully created!"
			redirect_to(:action => 'index')
		else
			flash[:error] = "User was not successfully created!"
			render "new"
		end
	
	end

	
end