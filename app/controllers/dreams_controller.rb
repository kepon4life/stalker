class DreamsController < ApplicationController

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

  # GET /dreams/new
  # GET /dreams/new.json
  def new
    @dream = Dream.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render :json => @dream }
    end
  end

  # GET /dreams/1/edit
  def edit
    @dream = Dream.find(params[:id])
  end



  # GET /dreams/tag
  # GET /dreams/tag.json
  def tag
    

    @files = Dir[PATH_TO_DREAMS + '*' + DREAM_EXTENSION] # PATH_TO_DREAMS & DREAM_EXTENSION : constant defined in config/initializers/constants.rb

    
    
    respond_to do |format|
      format.html # tag.html.erb
      format.json { render :json => @dream }
    end


  end


  # POST /dreams
  # POST /dreams.json
  def create
    @dream = Dream.new(params[:dream])

    respond_to do |format|
      if @dream.save
        flash[:success] = "Dream was successfully created!"
        format.html { redirect_to  :action => "index", :notice => 'Dream was successfully created.' }
        format.json { render :json => @dream, :status => :created, :location => @dream }
      else
        flash[:error] = "Dream was not successfully created!"
        format.html { render :action => "new" }
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
