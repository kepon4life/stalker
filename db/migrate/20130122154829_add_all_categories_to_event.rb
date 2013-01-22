class AddAllCategoriesToEvent < ActiveRecord::Migration
  def self.up
    add_column :events, :allCategories, :boolean, :default => 0
  end
 
  def self.down
    remove_column :events, :allCategories
  end
end
