class DreamsController < ApplicationController
  require 'fileutils'
  before_filter :authenticate_user


  # GET /dreams
  # GET /dreams.json
  def index
    @dreams = Dream.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render :json => @dreams }
    end
  end


  # GET /dreams/1/edit
  def edit
    @dream = Dream.find(params[:id])
  end



  # GET /dreams/tag
  # GET /dreams/tag.json
  def tag
    @categories = Category.all
    @files = Dir["public" + PATH_TO_DREAMS_UNTREATED + '*' + DREAM_EXTENSION] # PATH_TO_DREAMS & DREAM_EXTENSION : constant defined in config/initializers/constants.rb

    respond_to do |format|
      format.html # tag.html.erb
      format.json { render :json => @dream }
    end
  end


  def tagDream
    @dream = Dream.new(:file_name => params[:file_name], :is_valid => params[:is_valid], :category_ids => params[:category_ids] )
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

    respond_to do |format|
      flash[:success] = "Dream was successfully deleted!"
      format.html { redirect_to dreams_url }
      format.json { head :no_content }
    end
  end
end
