class Dream < ActiveRecord::Base
  attr_accessible :metadatas, :is_valid, :secret_room, :category_ids, :created_at, :token
  has_and_belongs_to_many :categories
  before_create :generate_token
  validates :metadatas, :presence => true


  protected
  def generate_token
    self.token = loop do
      random_token = SecureRandom.urlsafe_base64(nil, false)
      break random_token unless Dream.where(token: random_token).exists?
    end
  end

end
