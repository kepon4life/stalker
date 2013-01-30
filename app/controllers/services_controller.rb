class ServicesController < ApplicationController  
	
	def get_number_of_dreams_to_treat
		render :json => {:nbImg => Dir["public" + PATH_TO_DREAMS_UNTREATED + '*' + DREAM_EXTENSION].count}, :callback => params[:callback]
	end

	def get_dreams_for_event
		event = Event.find(params[:id])
		if event.allCategories
			categories = Category.all
		else
			categories = event.categories
		end

		dreams = []

		categories.each do |category|
			if category.dreams.count > 0
				category.dreams.each do |dream|
					dreams << dream unless dreams.include?(dream)
				end
			end
		end

		render:json => {:dreams => dreams}
	end


	
end