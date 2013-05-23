class DreamsController < ApplicationController
  require 'fileutils'


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

    @dreams = Kaminari.paginate_array(Dream.order("file_name "+@sort).where(:is_valid => @is_valid, :secret_room => @secret_room)).page(params[:page]).per(12)

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

      if(params[:valid] == "0" && params[:valid] == "1" && params[:secret_room] == "0" && params[:secret_room] == "1")
        raise "params invalids"
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
    dirContent = Dir["public" + PATH_TO_DREAMS_UNTREATED + '*' + DREAM_EXTENSION].sort.reverse # PATH_TO_DREAMS & DREAM_EXTENSION : constant defined in config/initializers/constants.rb
    

    if(!cookies[:nbImgPerPage])
      cookies[:nbImgPerPage] = 12
    end
    @nbImgPerPage = cookies[:nbImgPerPage].to_i
    @files = Kaminari.paginate_array(dirContent).page(params[:page]).per(@nbImgPerPage)

    respond_to do |format|
      format.html # tag.html.erb
      format.json { render :json => @dream }
    end
  end

  # GET /dreams/tagwithcat
  # GET /dreams/tagwithcat.json
  def tagWithCat
    @categories = Category.all
    @files = Dir["public" + PATH_TO_DREAMS_UNTREATED + '*' + DREAM_EXTENSION].sort.reverse # PATH_TO_DREAMS & DREAM_EXTENSION : constant defined in config/initializers/constants.rb

    respond_to do |format|
      format.html # tag.html.erb
      format.json { render :json => @dream }
    end
  end


  def tagDream
    #render:json => {:file_name => params[:file_name], :is_valid => params[:is_valid], :category_ids => params[:category_ids]}
    datas = params[:images]
    dreams = Array.new

    datas.each do |data|
      if data[1] != "0" 
        @dream = Dream.new(:file_name => data[0] + DREAM_EXTENSION)
        if data[1] == "1"
          @dream.is_valid = false
        elsif data[1] == "2"
          @dream.is_valid = true
          @dream.secret_room = false
        else
          @dream.is_valid = true
          @dream.secret_room = true
        end
        
        if @dream.save
          dreams.push @dream
          FileUtils.mv("public" + PATH_TO_DREAMS_UNTREATED + @dream.file_name , "public" + PATH_TO_DREAMS_TREATED + @dream.file_name)
        end


      end
    end


    


    #@dream = Dream.new(:file_name => params[:file_name], :is_valid => params[:is_valid], :secret_room => params[:in_secret_room] )
    respond_to do |format|
        format.json { render :json => dreams, :status => :created, :location => @dream }
    end
  end

  def tagDreamWithCat
    #render:json => {:file_name => params[:file_name], :is_valid => params[:is_valid], :category_ids => params[:category_ids]}

    @dream = Dream.new(:file_name => params[:file_name], :is_valid => params[:is_valid], :category_ids => params[:category_ids], :secret_room => params[:in_secret_room] )
    respond_to do |format|
      if @dream.save
        FileUtils.mv("public" + PATH_TO_DREAMS_UNTREATED + @dream.file_name , "public" + PATH_TO_DREAMS_TREATED + @dream.file_name)
        format.json { render :json => @dream, :status => :created, :location => @dream }
      else
        format.json { render :json => @dream.errors, :status => :unprocessable_entity }
      end
    end
  end




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

    FileUtils.remove_file("public" + PATH_TO_DREAMS_TREATED + @dream.file_name)

    respond_to do |format|
      flash[:success] = "Dream was successfully deleted!"
      format.html { redirect_to dreams_url }
      format.json { head :no_content }
    end
  end
end
