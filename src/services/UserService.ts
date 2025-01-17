import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { MysqlDataSource } from '../config/database';
import { Users } from '../database/entity/Users';
import { NodemailerProvider } from '../utils/NodemailerProvider';
import { resolve } from 'path';
import { TokenService } from './TokenService';

export class UserService {
  private userRepository: Repository<Users>;

  constructor() {
    this.userRepository = MysqlDataSource.getRepository(Users);
  }

  public async authenticate(
    email: string,
    password: string,
    rebemberMe: boolean
  ): Promise<string | undefined> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return undefined;
    }
    if (!user.confirmedEmail) {
      return undefined;
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return undefined;
    }
    const secretKey: string | undefined = process.env.JWT_PASS;
    if (!secretKey) {
      throw new Error('There is no token key');
    }
    //confirguração do token
    const expirationToken = rebemberMe ? '24h' : '1h';
    const token = jwt.sign({ id: user.id }, secretKey, {
      expiresIn: expirationToken
    });
    await new TokenService().saveToken(token);
    return token;
  }

  public async findById(id: number): Promise<Users | undefined> {
    return await this.userRepository.findOne({ where: { id } });
  }

  public async updatePassword(
    id: number,
    password: string
  ): Promise<void | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return undefined;
    }
    if (user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user.password = passwordHash;
      this.userRepository.save(user);
    }
  }

  public async recoverPassword(email: string): Promise<string> {
    const user: Users = await this.userRepository.findOne({ where: { email } });
    if (user) {
      const token = jwt.sign(
        { id: String(user.id) },
        (process.env.JWT_PASS as Secret) || null,
        {
          expiresIn: '1d',
          algorithm: 'HS256'
        }
      );
      const path = resolve(__dirname, '../templates/emailRecoverPassword.hbs');
      const subject = 'Redefinição de Senha';
      const variables = {
        userName: user.firstName,
        token: token
      };
      await new NodemailerProvider().sendEmail(email, subject, variables, path);
      return token;
    }
  }

  public async emailWelcome(email: string, firstName: string): Promise<void> {
    const user: Users = await this.userRepository.findOne({ where: { email } });
    const token = jwt.sign(
      { id: String(user.id) },
      (process.env.JWT_PASS as Secret) || null,
      {
        expiresIn: '1d',
        algorithm: 'HS256'
      }
    );
    await new TokenService().saveToken(token);
    const path = resolve(__dirname, '../templates/emailWelcome.hbs');
    const subject = 'Bem-vindo à Marte 101';
    const variables = {
      userName: firstName,
      token: token
    };
    await new NodemailerProvider().sendEmail(email, subject, variables, path);
  }

  public async findByEmail(email: string): Promise<Users | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  public async newUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<Users> {
    const newUser = this.userRepository.save({
      firstName,
      lastName,
      email,
      password
    });
    return newUser;
  }

  public async confirmEmail(user: Users) {
    user.confirmedEmail = true;
    await this.userRepository.save(user);
  }
}
