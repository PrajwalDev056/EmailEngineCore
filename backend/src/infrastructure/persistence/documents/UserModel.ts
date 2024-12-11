import { IsEmail, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ElasticSearchDocument } from './ElasticSearchDocument';

/**
 * User model class with validation
 */
export class UserModel extends ElasticSearchDocument {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  @Expose()
  public email: string;

  @IsOptional()
  @Length(4, 100, { message: 'Password must be at least 4 characters long' })
  @Exclude({ toPlainOnly: true })
  public password?: string;

  @IsOptional()
  @Expose()
  public outlookToken?: string;

  @IsOptional()
  @Expose()
  public refreshToken?: string;

  /**
   * User model constructor
   * @param email - User's email address
   * @param password - User's password (optional)
   * @param outlookToken - User's Outlook token (optional)
   * @param refreshToken - User's refresh token (optional)
   */
  constructor(
    email: string,
    password?: string,
    outlookToken?: string,
    refreshToken?: string,
  ) {
    super();
    this.email = email;
    this.password = password;
    this.outlookToken = outlookToken;
    this.refreshToken = refreshToken;
  }
}
