class Dream < ActiveRecord::Base
  attr_accessible :metadatas, :is_valid, :secret_room, :category_ids, :created_at, :token, :event_id
  before_create :generate_token
  belongs_to :event


  protected
  def generate_token
    self.token = loop do
      random_token = SecureRandom.urlsafe_base64(nil, false)
      break random_token unless Dream.where(token: random_token).exists?
    end
  end

end
