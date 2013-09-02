class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
		    	t.string :name 
		    	t.boolean :display_only_accepted
		    	t.boolean :is_active 
		    	t.string :image_file_name
		    	t.string :image_content_type
		    	t.string :image_file_size
		    	t.string :image_updated_at
		      	t.timestamps
    end
  end
end
