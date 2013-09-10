require "base64"
require "fileutils"
require 'mini_magick'
require 'pusher'

Pusher.app_id = PUSHER_API_APP_ID
Pusher.key = PUSHER_API_KEY
Pusher.secret = PUSHER_API_SECRET

class FrontendController < ApplicationController

	def slider
		@events = Event.find(:all, :conditions => { :is_active => true })
		respond_to do |format|
			format.html
		end
	end


	def simple_slider
		respond_to do |format|
			format.html
		end
	end

	def web_slider
		@id_dream = nil
		@dream_called_in_moderation = nil
		@dream_called_valid = nil
		if params[:id] && Dream.exists?(params[:id])
			dream = Dream.find(params[:id])
			if dream.is_valid
				@id_dream = params[:id]
				@dream_called_in_moderation = false
				@dream_called_valid = true
			else
				@dream_called_valid = false
				if params[:token] && params[:token] == dream.token
					@id_dream = params[:id]
					if dream.is_valid == false
						@dream_called_in_moderation = false
					else
						@dream_called_in_moderation = true
					end
				end
			end
		end


		I18n.locale = request.env['HTTP_ACCEPT_LANGUAGE'].scan(/^[a-z]{2}/).first
  		case I18n.locale
	  		when :en
	  			@msg_name = "Discover about what people dream"
	  			@msg_caption = "Stalker - Experimenting The Zone"
	  			@msg_description = "The new exhibition of the "
	  		else
	  			@msg_name = "Découvrez de quoi les gens rêvent"
	  			@msg_caption = "Stalker - Experimenter la Zone"
	  			@msg_description = "La nouvelle exposition de la"
  		end

		@events = Event.find(:all, :conditions => { :is_active => true })
		respond_to do |format|
			format.html
		end
	end

	def draw
		respond_to do |format|
			format.html
		end
	end

	def drawsmartphone
  		I18n.locale = request.env['HTTP_ACCEPT_LANGUAGE'].scan(/^[a-z]{2}/).first
  		case I18n.locale
	  		when :en
	  			@msg_intro = "Draw your wish."
	  			@msg_end   = "Thanks for your participation,<br />find it <a href=\"#\">here</a>."
	  		else
	  			@msg_intro = "Dessinez votre reve."
	  			@msg_end   = "Merci de votre participation,<br />retrouvez-la <a href=\"#\">ici</a>."
  		end

		respond_to do |format|
			format.html
		end
	end

	def show_dream

		@dream = Dream.find(params[:id])
		if(!@dream.is_valid && params[:token] != @dream.token)
			@dream = nil
		end

		respond_to do |format|
			format.html
		end
	end

	#event_id = 0 si provient de drawtable. Sinon de l'event_id du QR Code
	def save
		if params[:event_id] && params[:imgNormal]

			@dream = Dream.new()

			if params[:event_id] != ""
				if Event.exists?(params[:event_id])
					@dream.event_id = params[:event_id]
				elsif params[:event_id] == "0"
					@dream.event_id = Event.where(name: "La maison d'ailleurs").first.id
				end
			end

			imgNormal = treat_image_sended(Base64.decode64(params[:imgNormal].gsub("data:image/png;base64", "")));

			if @dream.save
				if imgNormal.write "public" + PATH_TO_DREAMS + @dream.id.to_s + DREAM_EXTENSION
					FileUtils::chmod(0444, "public" + PATH_TO_DREAMS + @dream.id.to_s + DREAM_EXTENSION)
					image = MiniMagick::Image.read(imgNormal)
					image.resize "364x200"
					image.write  "public" + PATH_TO_DREAMS_THUMBNAILS + @dream.id.to_s + DREAM_EXTENSION

					Pusher[PUSHER_CHANEL_DREAM_CREATED].trigger(PUSHER_EVENT_DREAM_CREATED, {:imgUrl => @dream.id.to_s + DREAM_EXTENSION, :event_id =>  @dream.event_id.to_s})
					render :json => {:imgUrl => @dream.id.to_s + DREAM_EXTENSION, :token => @dream.token, :dream_id => @dream.id.to_s}
				else
					render :json => {:imgUrl => "PAS OK"}
				end
			else
				render :json => {:imgUrl => "PAS OK"}
			end

		else
			render :json => {:imgUrl => "PAS OK"}
		end
	end

	def treat_image_sended(img)
		
		image = MiniMagick::Image.read(img)

		bgImage = MiniMagick::Image.open "public/frontend/img/dream_bg.png"

		pos_x = 0
		pos_y = 0
		
		if image[:width] > image[:height]
			image.resize bgImage[:width].to_s+"x"
			pos_y = ((bgImage[:height] - image[:height]) / 2)
		else
			image.resize "x"+bgImage[:height].to_s
			pos_x = ((bgImage[:width] - image[:width]) / 2)
		end

		result = bgImage.composite(image) do |c|
  			c.compose "Over" # OverCompositeOp
  			c.geometry "+"+pos_x.to_s+"+"+pos_y.to_s # copy second_image onto first_image from (20, 20)
		end

		return result
		
	end

	def file_put_contents( name, *contents )
		File.open( name, "a:binary" ){ |file|
			contents.each{ |item|
				file << item
			}
		}
	end


end