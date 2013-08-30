class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.string :name
      t.boolean :display_only_accepted
      t.boolean :is_active
	  t.timestamps
    end
  end
end
