import { describe, expect, it } from 'vitest';
import { aguaPendente, lerDadosSaude, linkAtalho, numeroDecimal, numeroInteiro, textoPeso } from './saude';

describe('Integração com o app Saúde (Atalhos)', () => {
  it('monta o link do atalho com texto de entrada', () => {
    expect(linkAtalho('No Eixo Peso', '74.2;90')).toBe('shortcuts://run-shortcut?name=No%20Eixo%20Peso&input=text&text=74.2%3B90');
    expect(linkAtalho('No Eixo Importar')).toBe('shortcuts://run-shortcut?name=No%20Eixo%20Importar');
    expect(linkAtalho('No Eixo Água', '500')).toContain('name=No%20Eixo%20%C3%81gua');
  });

  it('texto de peso usa vírgula (iPhone em português) ou ponto, cintura opcional', () => {
    expect(textoPeso(74.2, 90.5)).toBe('74,2;90,5');
    expect(textoPeso(74.25)).toBe('74,3');
    expect(textoPeso(74.2, 90, 'ponto')).toBe('74.2;90');
    expect(textoPeso(75)).toBe('75');
  });

  it('entende números em pt-BR e en', () => {
    expect(numeroDecimal('74,2 kg')).toBe(74.2);
    expect(numeroDecimal('74.2')).toBe(74.2);
    expect(numeroDecimal('1.074,5')).toBe(1074.5);
    expect(numeroDecimal('kg')).toBeUndefined();
    expect(numeroInteiro('8.234')).toBe(8234);
    expect(numeroInteiro('8,234 passos')).toBe(8234);
    expect(numeroInteiro('8234,6')).toBe(8234);
    expect(numeroInteiro('12.345.678')).toBe(12345678);
  });

  it('lê o texto copiado pelo atalho de importação', () => {
    expect(lerDadosSaude('NOEIXO;peso=74,2 kg;cintura=89,5 cm;passos=8.234')).toEqual({ peso: 74.2, cintura: 89.5, passos: 8234 });
    expect(lerDadosSaude('noeixo\npeso=74.2\npassos=0')).toEqual({ peso: 74.2, passos: 0 });
  });

  it('converte unidades estranhas e ignora valores absurdos ou vazios', () => {
    expect(lerDadosSaude('NOEIXO;peso=74200;cintura=0,895')).toEqual({ peso: 74.2, cintura: 89.5 });
    expect(lerDadosSaude('NOEIXO;peso=;cintura=5;passos=abc')).toEqual({});
  });

  it('retorna null para texto que não é do No Eixo', () => {
    expect(lerDadosSaude('lista de compras')).toBeNull();
  });

  it('água pendente nunca é negativa', () => {
    expect(aguaPendente(1500, 1000)).toBe(500);
    expect(aguaPendente(500, 1000)).toBe(0);
    expect(aguaPendente(750)).toBe(750);
  });
});
