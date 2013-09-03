class DreamsController < ApplicationController
  require 'fileutils'
  require 'pusher'

  Pusher.app_id = PUSHER_API_APP_ID
  Pusher.key = PUSHER_API_KEY
  Pusher.secret = PUSHER_API_SECRET
  
  http_basic_authenticate_with :name => APPLICATION_ADMIN_USERNAME, :password => APPLICATION_ADMIN_PASSWORD

  # GET /dreams
  # GET /dreams.json
  def index

    @sort = "desc"
    @secret_room = true
    @is_valid = true

    if(!params[:sort] && !params[:special] && !params[:valid])
      if(cookies[:sort] && cookies[:sort] == "asc")
        @sort = "asc"
      end

      if(cookies[:special] && cookies[:special] == "false")
        @secret_room = false
      end

      if(cookies[:valid] && cookies[:valid] == "false")
        @is_valid = false
      end

     else
      if params[:sort] == "asc"
        @sort = "asc"
        cookies[:sort] = "asc"
      else
        cookies[:sort] = "desc"
      end

      if params[:special] == "false"
        @secret_room = false
        cookies[:special] = false
      else
        cookies[:special] = true
      end
    
      if params[:valid] == "false"
        @is_valid = false
        cookies[:valid] = false
      else
        cookies[:valid] = true
      end  
    end

    @dreams = Kaminari.paginate_array(Dream.order("id "+@sort).where(:is_valid => @is_valid, :secret_room => @secret_room)).page(params[:page]).per(12)

    respond_to do |format|
      format.html # index.html.erb
      format.json { render :json => @dreams }
    end
  end


  # GET /dreams/1/edit
  def edit
    @dream = Dream.find(params[:id])
  end

  def changeStatus

    begin
      dream = Dream.find(params[:id])

      if(params[:valid] != "0" && params[:valid] != "1")
        raise "params invalids for validity"
      end

      if(params[:secret_room] != "0" && params[:secret_room] != "1")
        raise "params invalids for secret room"
      end

      if(params[:secret_room] == "1" && params[:valid] == "0")
        raise "you can't do that dude!"
      end
      
      dream.is_valid = params[:valid].to_i
      dream.secret_room = params[:secret_room].to_i
      dream.save

      respond_to do |format|
        flash[:success] = "Dream was successfully updated!"
        format.html { redirect_to dreams_url }
        format.json { head :no_content }
      end

      rescue => error
        respond_to do |format|
          flash[:error] = "Dream was not successfully updated! " + error.message
          format.html { redirect_to dreams_url }
          format.json { head :no_content }
        end
      end
  end



  # GET /dreams/tag
  # GET /dreams/tag.json
  def tag    
    dreamsNotTagged = Dream.where(:is_valid => nil, :secret_room => nil).all

    if(!cookies[:nbImgPerPage])
      cookies[:nbImgPerPage] = 12
    end
    @nbImgPerPage = cookies[:nbImgPerPage].to_i
    @dreams = Kaminari.paginate_array(dreamsNotTagged).page(params[:page]).per(@nbImgPerPage)

    respond_to do |format|
      format.html # tag.html.erb
    end
  end

  # GET /dreams/tagwithcat
  # GET /dreams/tagwithcat.json
  #def tagWithCat
  #  @categories = Category.all
  #  @files = Dir["public" + PATH_TO_DREAMS_UNTREATED + '*' + DREAM_EXTENSION].sort.reverse # PATH_TO_DREAMS & DREAM_EXTENSION : constant defined in config/initializers/constants.rb

  #  respond_to do |format|
  #    format.html # tag.html.erb
  #    format.json { render :json => @dream }
  #  end
  #end


  def tagDream

    #render:json => {:file_name => params[:file_name], :is_valid => params[:is_valid], :category_ids => params[:category_ids]}
    datas = params[:images]
    dreams = Array.new

    datas.each do |data|
      if data[1] != "0" 
        @dream = Dream.find(data[0])
        if @dream
          if data[1] == "1"
            @dream.is_valid = false
            @dream.secret_room = false
          elsif data[1] == "2"
            @dream.is_valid = true
            @dream.secret_room = false
          else
            @dream.is_valid = true
            @dream.secret_room = true
          end

          
        
          if @dream.save
            dreams.push @dream
            if data[1] != "1"
              Pusher[PUSHER_CHANEL_DREAM_VALIDATED].trigger(PUSHER_EVENT_DREAM_VALIDATED, {:imgUrl => @dream.id.to_s + DREAM_EXTENSION})
            end
          end
        end
      end
    end

    #@dream = Dream.new(:file_name => params[:file_name], :is_valid => params[:is_valid], :secret_room => params[:in_secret_room] )
    respond_to do |format|
        format.json { render :json => dreams, :status => :created, :location => @dream }
    end
  end

  #def tagDreamWithCat
    #render:json => {:file_name => params[:file_name], :is_valid => params[:is_valid], :category_ids => params[:category_ids]}

  #  @dream = Dream.new(:file_name => params[:file_name], :is_valid => params[:is_valid], :category_ids => params[:category_ids], :secret_room => params[:in_secret_room] )
  #  respond_to do |format|
  #    if @dream.save
  #      FileUtils.mv("public" + PATH_TO_DREAMS_UNTREATED + @dream.file_name , "public" + PATH_TO_DREAMS_TREATED + @dream.file_name)
  #      format.json { render :json => @dream, :status => :created, :location => @dream }
  #    else
  #      format.json { render :json => @dream.errors, :status => :unprocessable_entity }
  #    end
  #  end
  #end




  # PUT /dreams/1
  # PUT /dreams/1.json
  def update
    params[:dream][:category_ids] ||= [] #fix l'update en déselectionnant tout
    @dream = Dream.find(params[:id])

    respond_to do |format|
      if @dream.update_attributes(params[:dream])
        flash[:success] = "Dream was successfully updated!"
        format.html { redirect_to  :action => "index", :notice => 'Dream was successfully updated.' }
        format.json { head :no_content }
      else
        flash[:error] = "Dream was not successfully updated!"
        format.html { render :action => "edit" }
        format.json { render :json => @dream.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /dreams/1
  # DELETE /dreams/1.json
  def destroy
    @dream = Dream.find(params[:id])
    @dream.destroy
    FileUtils.remove_file("public" + PATH_TO_DREAMS + @dream.id.to_s + DREAM_EXTENSION)
    respond_to do |format|
      flash[:success] = "Dream was successfully deleted!"
      format.html { redirect_to dreams_url }
      format.json { head :no_content }
    end
  end


  def destroy_all
    Dream.delete_all
    FileUtils.rm_r Dir.glob("public" + PATH_TO_DREAMS + "*")
    FileUtils.rm_r Dir.glob("public" + PATH_TO_DREAMS_THUMBNAILS + "*")
    respond_to do |format|
        flash[:success] = "Dreams successfully deleted!"
        format.html { redirect_to action: 'dev_tests' }
        format.json { head :no_content }

    end
  end


  def populate_for_test

    nb_of_dreams_to_add = 1000
    nb_of_dreams_to_copy = Dir.glob("public/tests/dreams/*.png").size

    if params[:nb_of_dreams_to_add].to_i > 0
      nb_of_dreams_to_add = params[:nb_of_dreams_to_add].to_i
    end

    for i in 0..nb_of_dreams_to_add-1
      event_id = Event.first(:offset => rand(Event.count)).id
      year = Time.now.year - rand(2)
      month = rand(12) + 1
      day = rand(31) + 1
      date = Time.local(year, month, day)
      today = Date.today
      if(date > today)
        date = Time.local(year-1, month, day)
      end
      random_number = rand(0..nb_of_dreams_to_copy-1)
      file = Dir.glob("public/tests/dreams/*.png")[random_number]
      dream = Dream.new(:event_id => event_id,:is_valid => [true, false].sample, :secret_room => [true, false].sample, :metadatas => "{'datas':null}", :created_at => date)
      dream.save
      FileUtils.copy_file(file, "public" + PATH_TO_DREAMS + dream.id.to_s + DREAM_EXTENSION, preserve = false, dereference = true)
      FileUtils.copy_file("public/tests/dreams-small/" + file.split("/")[3] , "public" + PATH_TO_DREAMS_THUMBNAILS + dream.id.to_s + DREAM_EXTENSION, preserve = false, dereference = true) 
    end

    respond_to do |format|
        flash[:success] = nb_of_dreams_to_add.to_s + " dreams successfully added!"
        format.html { redirect_to action: 'dev_tests' }
        format.json { head :no_content }

    end
  end


  def dev_tests

    count_dreams_tagged_accepted_special = Dream.where(:is_valid => true, :secret_room => true).count()
    count_dreams_tagged_just_accepted = Dream.where(:is_valid => true, :secret_room => false).count()
    count_dreams_tagged_unaccepted = Dream.where(:is_valid => false, :secret_room => false).count()

    @dreams_tot = Dream.count()

    @dreams_untagged = Dream.where(:is_valid => nil, :secret_room => nil).count()
    @dreams_tagged = count_dreams_tagged_accepted_special + count_dreams_tagged_just_accepted  + count_dreams_tagged_unaccepted
    @dreams_tagged_accepted = count_dreams_tagged_accepted_special + count_dreams_tagged_just_accepted
    @dreams_tagged_accepted_special = count_dreams_tagged_accepted_special
    @dreams_tagged_just_accepted = count_dreams_tagged_just_accepted
    @dreams_tagged_unaccepted = count_dreams_tagged_unaccepted

    respond_to do |format|
        format.html # tag.html.erb
    end

  end

end
