class ServicesController < ApplicationController  
	
	def get_number_of_dreams_to_treat

		respond_to do |format|
			format.js { render :json => {:nbImg => Dir["public" + PATH_TO_DREAMS_UNTREATED + '*' + DREAM_EXTENSION].count}, :callback => params[:callback] }
		end
	
	end

	
end