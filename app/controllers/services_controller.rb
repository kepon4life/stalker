class ServicesController < ApplicationController

	def get_number_of_dreams_to_treat
		dreams = Dream.where(:is_valid => nil, :secret_room => nil).all
		render :json => {:nbImg => dreams.count}, :callback => params[:callback]
	end

	def get_dreams_validated
		dreams = Dream.where(:is_valid => true)

		render:json => dreams.to_json(:only => [:id,:created_at,:metadatas])
	end

	def get_dream_for_simple_slider

		dream = Dream.find(:first, :conditions => ["is_valid = ? AND id > " + params[:id], true, ])
		if dream == nil
			dream = Dream.find(:first, :conditions => ["is_valid = ?", true])
		end

		if dream == nil
			render :json => nil
		else
			render :json => dream.to_json(:only => [:id])
		end

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

		render :json => dreams.to_json(:only => [:file_name])
	end

	def get_dreams_for_secret_room
		dreams = Dream.where(:secret_room => true)
		render :json => dreams.to_json(:only => [:id, :metadatas, :created_at])
	end


	def get_categories
		categories = Category.all
		cat = {}

		categories.each do |category|
			c = category.name
			cat[category.id] = c
		end
		render :json => cat
	end







end