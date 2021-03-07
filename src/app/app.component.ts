import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'game';
  public Board: Array<Row> = [];
  public SelectedSquare: SquareModel;
  public ActivePlayer: number = PlayerType.Player1;

  constructor() {
    this.CreateBoardVM();
    this.InitializePlayer1();
    this.InitializePlayer2();
  }

  ngAfterViewInit(): void {

  }

  public CreateBoardVM(): void {
    for (let i = 1; i <= 5; i++) {
      const temprow = new Row();
      temprow.RowId = String.fromCharCode(64 + i);
      for (let j = 1; j <= 5; j++) {
        const tempsquare = new SquareModel();
        tempsquare.Id = String.fromCharCode(64 + j) + i;
        tempsquare.PieceId = null;
        tempsquare.PlayerId = null;
        temprow.Row.push(tempsquare);
      }
      this.Board.push(temprow);
    }
  }

  public InitializePlayer1(): void {
    this.Board.filter(e => e.RowId === 'A').forEach(e => {
      e.Row.forEach(s => {
        s.PlayerId = PlayerType.Player1;
        if (s.Id === 'A1' || s.Id === 'E1') {
          s.PieceId = PieceType.Line;
        } else if (s.Id === 'B1' || s.Id === 'D1') {
          s.PieceId = PieceType.Triangle;
        } else if (s.Id === 'C1') {
          s.PieceId = PieceType.Square;
        }
      });
    });
  }

  public InitializePlayer2(): void {
    this.Board.filter(e => e.RowId === 'E').forEach(e => {
      e.Row.forEach(s => {
        s.PlayerId = PlayerType.Player2;
        if (s.Id === 'A5' || s.Id === 'E5') {
          s.PieceId = PieceType.Line;
        } else if (s.Id === 'B5' || s.Id === 'D5') {
          s.PieceId = PieceType.Triangle;
        } else if (s.Id === 'C5') {
          s.PieceId = PieceType.Square;
        }
      });
    });
  }

  public OnBoxClick(s: SquareModel): void {
    if (s.IsSelected) {
      if (this.SelectedSquare.Id === s.Id) {
        this.UnselectAll();
      } else {
        if (s.IsEmpty) {
          this.Move(s);
        } else if (this.SelectedSquare.PlayerId !== s.PlayerId) {
          this.Capture(this.SelectedSquare, s);
        } else if (this.SelectedSquare.PlayerId === s.PlayerId) {
          this.Merge(this.SelectedSquare, s);
        }
        this.ActivePlayer = s.PlayerId === PlayerType.Player1 ? PlayerType.Player2 : PlayerType.Player1;
        this.UnselectAll();
      }
    } else {
      if (s.PlayerId === this.ActivePlayer) {
        this.HighlightPossibleSquares(s);
        s.IsSelected = true;
        this.SelectedSquare = s;
      }
    }
  }


  public Move(to: SquareModel): void {
    to.PieceId = this.SelectedSquare.PieceId;
    to.PlayerId = this.SelectedSquare.PlayerId;
    this.SelectedSquare.PieceId = null;
    this.SelectedSquare.PlayerId = null;
  }

  public Merge(from: SquareModel, to: SquareModel): void {
    if (from.PieceId + to.PieceId <= PieceType.Square) {
      to.PieceId = from.PieceId + to.PieceId;
      from.PieceId = null;
      from.PlayerId = null;
    }
  }

  public Capture(captor: SquareModel, captive: SquareModel): void {
    if (captor.PieceId >= captive.PieceId) {
      captive.PlayerId = captor.PlayerId;
      captor.PieceId = (captor.PieceId - captive.PieceId) + 1;
    } else {
      captive.PieceId = captive.PieceId - captor.PieceId;
      captor.PlayerId = null;
      captor.PieceId = null;
    }
  }

  public UnselectAll(): void {
    this.Board.forEach(b => {
      b.Row.forEach(s => {
        s.IsSelected = false;
      });
    });
  }

  public HighlightPossibleSquares(clickedsquare: SquareModel): void {
    this.UnselectAll();
    this.Board.forEach(b => {
      b.Row.forEach(s => {
        clickedsquare.HighLighted.forEach(e => {
          if (s.Id === e) {
            s.IsSelected = true;
          }
        });
      });
    });
  }

  get Player1Class(): string {
    return this.ActivePlayer === PlayerType.Player1 ? 'player-label player1-active' : 'player-label';
  }

  get Player2Class(): string {
    return this.ActivePlayer === PlayerType.Player2 ? 'player-label player2-active' : 'player-label';
  }
}


class SquareModel {
  public Id: string;
  public PieceId: number;
  public PlayerId: number;
  public IsSelected = false;

  public get PieceClass(): string {
    let cls = '';
    if (this.PieceId === PieceType.Dot) {
      cls = 'dot';
    } else if (this.PieceId === PieceType.Line) {
      cls = 'line';
    } else if (this.PieceId === PieceType.Triangle) {
      cls = 'triangle';
    } else if (this.PieceId === PieceType.Square) {
      cls = 'square';
    }

    if (this.PlayerId === PlayerType.Player1) {
      cls += this.PieceId === PieceType.Triangle ? ' red-down' : ' red';
    } else if (this.PlayerId === PlayerType.Player2) {
      cls += this.PieceId === PieceType.Triangle ? ' blue-up' : ' blue';
    }
    return cls;
  }

  get BoxClass(): string {
    return this.IsSelected ? 'box selected' : 'box';

  }

  public get IsEmpty(): boolean {
    return this.PieceId === null;
  }

  public get IsMovable(): boolean {
    return this.PieceId !== PieceType.Dot;
  }

  public get CharOfId(): string {
    return this.Id.charAt(0);
  }

  public get NoOfId(): number {
    return parseInt(this.Id.charAt(1));
  }


  public get HighLighted(): Array<string> {
    let ids = [];
    if (this.PieceId === PieceType.Triangle) {
      ids = this.HighLightedForTriangle;
    } else if (this.PieceId === PieceType.Square) {
      ids = this.HighLightedForSquare;
    } else if (this.PieceId === PieceType.Line) {
      ids = this.HighLightedForLine;
    }
    return ids
  }

  public get HighLightedForTriangle(): Array<string> {
    let ids = [];
    ids.push(this.TopLeft);
    ids.push(this.TopRight);
    ids.push(this.BottomLeft);
    ids.push(this.BottomRight);
    return ids.filter(f => f !== null);
  }

  public get HighLightedForSquare(): Array<string> {
    let ids = [];
    ids.push(this.Top);
    ids.push(this.Bottom);
    ids.push(this.Left);
    ids.push(this.Right);
    ids.push(this.TopLeft);
    ids.push(this.TopRight);
    ids.push(this.BottomLeft);
    ids.push(this.BottomRight);
    return ids.filter(f => f !== null);
  }

  public get HighLightedForLine(): Array<string> {
    let ids = [];
    ids.push(this.Top);
    ids.push(this.Bottom);
    return ids.filter(f => f !== null);
  }

  public get Left(): string {
    let left = null;
    if (this.CharOfId.charCodeAt(0) > 65) {
      left = String.fromCharCode(this.CharOfId.charCodeAt(0) - 1) + this.NoOfId;
    }
    return left;
  }

  public get Right(): string {
    let right = null;
    if (this.CharOfId.charCodeAt(0) < 69) {
      right = String.fromCharCode(this.CharOfId.charCodeAt(0) + 1) + this.NoOfId;
    }
    return right;
  }

  public get Top(): string {
    let top = null;
    if ((this.NoOfId - 1) >= 1) {
      top = this.CharOfId + (this.NoOfId - 1);
    }
    return top;
  }

  public get Bottom(): string {
    let bottom = null;
    if ((this.NoOfId + 1) <= 5) {
      bottom = this.CharOfId + (this.NoOfId + 1);
    }
    return bottom;
  }

  public get TopRight(): boolean {
    let tr = null;
    if (this.Top !== null && this.Right !== null) {
      tr = this.Right.charAt(0) + this.Top.charAt(1);
    }
    return tr;
  }

  public get BottomRight(): boolean {
    let br = null;
    if (this.Right !== null && this.Bottom !== null) {
      br = this.Right.charAt(0) + this.Bottom.charAt(1);
    }
    return br;
  }

  public get BottomLeft(): boolean {
    let bl = null;
    if (this.Bottom !== null && this.Left !== null) {
      bl = this.Left.charAt(0) + this.Bottom.charAt(1);
    }
    return bl;
  }

  public get TopLeft(): boolean {
    let tl = null;
    if (this.Left !== null && this.Top !== null) {
      tl = this.Left.charAt(0) + this.Top.charAt(1);
    }
    return tl;
  }
}

class Row {
  public RowId: string;
  public Row: Array<SquareModel> = [];
}

enum PieceType {
  Dot = 1,
  Line = 2,
  Triangle = 3,
  Square = 4
}

enum PlayerType {
  Player1 = 0,
  Player2 = 1
}
